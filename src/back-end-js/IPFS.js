const IPFS = require('ipfs-daemon');
const node = new IPFS();
const series = require('async/series');



function sendToIPFS(dataToSend) {
    console.log("data to send is from IPFS.js! ", dataToSend);
    series([
      (cb) => node.on('ready', cb),
      (cb) => node.version((err, version) => {
        if (err) { return cb(err) }
        console.log('Version:', version.version)
        cb()
      }),

      // Create the File to add, a file consists of a path + content. More details on

      (cb) => node.files.add({
        path: 'hello.txt',
        content: Buffer.from(dataToSend)
      }, (err, filesAdded) => {
        if (err) { return cb(err) }

        console.log('\nAdded file:', filesAdded[0].path, filesAdded[0].hash)
        fileMultihash = filesAdded[0].hash
        cb()
      }),
      (cb) => node.files.cat(fileMultihash, (err, data) => {
        if (err) { return cb(err) }

        console.log('\nFile content:')
        process.stdout.write(data)
      })
    ]);

}

module.exports = {sendToIPFS: sendToIPFS};
