let priviewhasTokenFlag = false
let priviewGlobaltoken = ''

function setToken() {
  if (priviewhasTokenFlag) {
    return
  }
  const getToken = () => {
    let clientID = 'f5ff2467249c480f8404f8061ce1aa31'
    let clientSecret = '9e97cd3d0771f4e787bf0632166db04f829f25356520a388'
    let username = ''
    let password = ''
    if (clientID && clientSecret) {
      try {
        token = ''
        $.ajax({
          type: 'POST',
          url: '/baas/auth/v1.0/oauth2/token',
          data: `grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}`,
          async: false,
          contentType: "application/x-www-form-urlencoded",
          success: function (response) {
            if (response && response.access_token) {
              priviewGlobaltoken = response.access_token
              $.ajaxSetup({
                headers: {
                  'access-token': priviewGlobaltoken
                }
              })
            }
          }
        })
      } catch (err) {
        console.err(err)
      }
    } else if (username && password) {
      try {
        token = ''
        $.ajax({
          type: 'POST',
          url: '/baas/auth/v1.0/login',
          data: JSON.stringify({
            'username': username,
            'password': password,
            'captcha': ''
          }),
          async: false,
          contentType: 'application/json',
          success: function (response) {
            console.log(response)
            if (response && response.resCode == '0') {
              priviewGlobaltoken = response.result.token
              $.ajaxSetup({
                headers: {
                  'access-token': priviewGlobaltoken
                }
              })
            }
          }
        })
      } catch (err) {
        console.err(err)
      }
    }
  }
  getToken()
  hasTokenFlag = true
  setInterval(getToken, 10 * 60 * 1000 /* 10分钟更新一次token */)
}
setToken()
