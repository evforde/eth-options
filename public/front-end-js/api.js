// static client side api

// for making get and post requests to BACK END api: like this
// get('/api/whoami', {}, function(user_id) {
//     return user_id
// });



function formatParams(params) {
  return Object
    .keys(params)
    .map(function(key) {
      return key+'='+encodeURIComponent(params[key])
    })
    .join('&');
}

// params is given as a JSON
function get(endpoint, params, successCallback, failureCallback) {
  const xhr = new XMLHttpRequest();
  const fullPath = endpoint + '?' + formatParams(params);
  xhr.open('GET', fullPath, true);
  xhr.onload = function(err) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (successCallback)
            if (xhr.responseText) {
          successCallback(JSON.parse(xhr.responseText));
      }
      } else {
        if (failureCallback)
        failureCallback(xhr.statusText);
      }
    }
  };
  xhr.onerror = function(err) {
    failureCallback(xhr.statusText);
  }
  xhr.send(null);
}

function post(endpoint, params, successCallback, failureCallback) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', endpoint, true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.withCredentials = true;
  xhr.onload = function(err) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (successCallback)
          successCallback(JSON.parse(xhr.responseText));
      } else {
        if (failureCallback)
          failureCallback(xhr.statusText);
      }
    }
  };
  // xhr.onerror = function(err) {
  //   reject(xhr.statusText);
  // };
  xhr.onerror = function () {
      console.log("ERROR HERE", xhr.status);
};
// console.log(params, 'MY params');
  xhr.send(JSON.stringify(params));
}
