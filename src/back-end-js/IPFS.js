// const IPFS = require('ipfs-daemon');
const IPFS = require('ipfs')
const node = new IPFS();
const series = require('async/series');


function sendToIPFS(dataToSend) {
    console.log("data to send is from IPFS.js! ", dataToSend);

    var fileMultihash;
    series([
      (cb) => node.on('ready', cb),
      (cb) => node.version((err, version) => {
        if (err) {
            console.log("error version");
             return cb(err)
          }
        console.log('Version:', version.version)
        cb()
      }),
      // Create the File to add, a file consists of a path + content. More details on

      (cb) => node.files.add({
        path: 'hello.txt',
        content: Buffer.from(dataToSend)
      }, (err, filesAdded) => {
        if (err) {
        console.log("error writing to file");
        return cb(err);
        }
        console.log('\nAdded file:', filesAdded[0].path, filesAdded[0].hash)
        fileMultihash = filesAdded[0].hash
        cb()
      }),
      // RETRIEVE files from ipfs
      (cb) => node.files.cat(fileMultihash, (err, data) => {
        if (err) {
        console.log("err in catting");
        return cb(err)
        }

        console.log('\nFile content:')
        process.stdout.write(data)
    },
    console.log("hi2")
),

],
    function(err, result) {
        if (err) { return "error" }
        return "success";
        console.log(fileMultihash, 'si');
    }
)
}




function getFromIPFS(file) {

    series([
        (cb) => node.on('ready', cb),

        // RETRIEVE files from ipfs
        // fileMultihash like '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
        (cb) => node.files.get(fileMultihash, (err, data) => {
          if (err) {
          console.log("err in catting");
          return cb(err)
          }

          console.log('\nFile content:')

        //           data = array of {
        //   path: '/tmp/myfile.txt',
        //   content: <data as a Buffer>
        // }

        console.log(data.content.toString('utf8'));
          // TODO POST TO front end?
          process.stdout.write(data)
      })
  ])
}

module.exports = {sendToIPFS: sendToIPFS, getFromIPFS: getFromIPFS};
