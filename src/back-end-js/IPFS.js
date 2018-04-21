// const IPFS = require('ipfs-daemon');
const IPFS = require('ipfs')
const node = new IPFS();
const series = require('async/series');



function sendToIPFS(dataToSend) {
  node.files.add({
    path: 'hello.txt',
    content: Buffer.from(JSON.stringify(dataToSend))
  }, (err, filesAdded) => {
    if (err) {
      console.log("error writing to file");
      return err;
    }
  else {
    fileHash = filesAdded[0].hash
    console.log('\nAdded file:', filesAdded);
    // just read out contents if need!
    node.files.cat(fileHash, (err, data) => {
      if (err) {
      console.log("err in catting");
      return err
      }
      console.log('\nFile content:')
      process.stdout.write(data)
    })
  }
  }
)
}

function getFromIPFS(file) {
  // fileHash like '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

  node.files.get(fileHash, (err, data) => {
    if (err) {
      console.log("error", err);
    }
    else {

  //           data = array of {
  //   path: '/tmp/myfile.txt',
  //   content: <data as a Buffer>
  // }
  console.log(data.content.toString('utf8'));
  // TODO POST TO front end?
  process.stdout.write(data)

    }
  })

}

module.exports = {sendToIPFS: sendToIPFS, getFromIPFS: getFromIPFS};
