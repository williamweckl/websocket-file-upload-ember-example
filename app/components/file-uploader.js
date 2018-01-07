import Component from '@ember/component';

export default Component.extend({
  socket: Ember.inject.service(),

  startRange() {
    return $('#start-range').val() || 0;
  },
  endRange() {
    return $('#end-range').val() || 30;
  },

  startVideoOnRange() {
    const video = $("#video")[0];
    video.currentTime = this.startRange();
    video.play();
  },

  didInsertElement() {
    const socket = this.get('socket');
    const channel = socket.connect();

    const _self = this;

    $(document).on("change", "#super_file", function(evt) {
      // var start_range = $('#start_range').val() || 0;
      // var end_range = $('#end_range').val() || 30;
      var $source = $('#video_here');
      var src = URL.createObjectURL(this.files[0]);
      // src = `${src}#t=${start_range},${end_range}`;
      $source[0].src = src;
      $source.parent()[0].load();
      _self.startVideoOnRange();
    });

    // Do range loop
    const video = $("#video");
    video.on("ended", function () {
      _self.startVideoOnRange();
    });
    video.on("timeupdate", function (event) {
      var endRange = _self.endRange();
      if (video[0].currentTime >= endRange) {
        _self.startVideoOnRange();
      }
    });
    $('#start_range').change(function (event) {
      $('#video')[0].currentTime = event.target.value;
    });

    //Submit
    let button = $("#do-upload");
    button.click(function (e) {
      e.preventDefault();
      _self.onUpload(channel);
    });
  },

  onUpload(channel) {
    const _self = this;
    let fileInput = document.getElementById("super_file");
    let file = fileInput.files[0];
    let reader = new FileReader();

    console.log("esta uploadiando 1");

    reader.addEventListener("load", function(){
      let startRange = _self.startRange();
      let endRange = _self.endRange();

      let payload = {
        binary: reader.result.split(",", 2)[1],
        filename: file.name,
        start_range: startRange,
        end_range: endRange
      };

      console.log("esta uploadiando 2");

      const push = channel.push("upload:file", payload);
      console.log(push);
      console.log(channel.pushBuffer);
      console.log(push.pushBuffer);

      push.receive(
        "ok", (reply) => {
          console.log("got reply", reply)
      })
    }, false)
    reader.readAsDataURL(file)
  },
});
