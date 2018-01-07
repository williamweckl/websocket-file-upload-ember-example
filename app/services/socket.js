import PhoenixSocket from 'phoenix/services/phoenix-socket';

export default PhoenixSocket.extend({

  init() {
    console.log('injetou');
    // You may listen to open, "close" and "error"
    this.on('open', () => {
      console.log('Socket was opened!');
    })
  },

  connect(/*url, options*/) {
    // const myjwt = "abacnwih12eh12...";
    // connect the socket
    this._super("ws://localhost:4000/socket", {
      // params: {token: myjwt}
    });

    // join a channel
    // const channel = this.joinChannel("upload:new", {
    //   nickname: "Mike"
    // });
    const channel = this.joinChannel("upload:new", {});

    // add message handlers
    channel.on("notification", () => _onNotification(...arguments));

    return channel;
  },

  _onNotification(message) {
    console.log(message);
    alert(`Notification: ${message}`);
  }
});