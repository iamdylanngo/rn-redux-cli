require('child_process')
  .spawn('npm', ['i','--save','redux','react-redux','--save-exact'], {stdio:'inherit'})
  .on('exit', function (error) {

    if(!error){
      console.log('Success!');
    }

  });