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

    _self.set('loadingProgress', 0);

    console.log("esta uploadiando 1");

    console.log("reader", reader);

    reader.addEventListener("load", function(){
      console.log("event load");

      let startRange = _self.startRange();
      let endRange = _self.endRange();

      let payload = {
        binary: reader.result.split(",", 2)[1],
        filename: file.name,
        start_range: parseInt(startRange),
        end_range: parseInt(endRange)
      };

      // console.log("esta uploadiando 2", _self.get('socket'));
      // console.log("esta uploadiando 2", _self.get('socket.socket'));
      // console.log("esta uploadiando 2", _self.get('socket.socket.conn'));
      console.log("esta uploadiando 2", _self.get('socket.socket.conn.bufferedAmount'));

      const push = channel.push("upload:file", payload, 9999999999);
      _self.computeLoadingProgress(file);
      console.log(push);

      // console.log("esta uploadiando 3", _self.get('socket'));
      // console.log("esta uploadiando 3", _self.get('socket.socket'));
      // console.log("esta uploadiando 3", _self.get('socket.socket.conn'));
      console.log("esta uploadiando 3", _self.get('socket.socket.conn.bufferedAmount'));

      push
        .receive("ok", function (msg) {
          console.log("created message", msg);
          console.log("bufferedAmount", _self.get('socket.socket.conn.bufferedAmount'));
          _self.set('processingFile', false);
        })
        .receive("error", (reasons) => console.log("create failed", reasons) )
        .receive("timeout", () => console.log("Networking issue..."))
    }, false)
    reader.readAsDataURL(file)
  },

  computeLoadingProgress: function (file) {
    console.log('computeLoadingProgress');

    const _self = this;
    let bufferedAmount = _self.get('socket.socket.conn.bufferedAmount');

    if (bufferedAmount === 0) {
      _self.set('loadingProgress', 100);
      _self.set('processingFile', true);
      return;
    }

    console.log('file', file);
    console.log('bufferedAmount', bufferedAmount);

    var loaded = file.size - bufferedAmount;
    var percentage = Math.round((loaded * 100) / file.size );
    _self.set('loadingProgress', percentage);

    // Wait 1 second and fetch percentage again
    return setTimeout(function() {
      console.log('computeLoadingProgress setInterval');
      return _self.computeLoadingProgress(file);
    }, 1000);
  },

});
