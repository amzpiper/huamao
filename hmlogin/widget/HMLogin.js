var HMLogin = StudioWidgetWrapper.extend({
    /**
    * Triggered when initializing a widget and will have the code that invokes rendering of the widget.
    */
    init: function () {
        if (top.location != self.location && Studio.inReader) {
            top.location = self.location.href;
            return false;
        }
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        if ((typeof (Studio) != "undefined") && Studio) {
            Studio.registerEvents(thisObj, "GoToViewPrivacy", "To View Privacy", []);
            Studio.registerEvents(thisObj, "GoToViewEnglishPrivacy", "To View English Privacy", []);
            Studio.registerEvents(thisObj, "GoToForgetPassword", "To Forget Password", []);
        }
    },

    /** 
    * Triggered from init method and is used to render the widget.
    */
    render: function () {
        var thisObj = this;
        var elem = thisObj.getContainer();

        /** 
        * API to get base path of your uploaded widget API file.
        */
        if (elem) {
            var containerDiv = $(".scfClientRenderedContainer", elem);
            if (containerDiv.length) {
                $(containerDiv).empty();
            } else {
                containerDiv = document.createElement('div');
                containerDiv.className = "scfClientRenderedContainer";
                $(elem).append(containerDiv);
            }
        }

        /**
        * API to bind global events to the item DOM, it should not be deleted if there will some events to trigger in this widget.
        */
        thisObj.sksBindItemEvent();

        /**
        * API to refresh the previously bound events when a resize or orientation change occurs.
        */
        $(window).resize(function () {
            thisObj.sksRefreshEvents();
        });
        thisObj.initVue();
    },

    initVue: function () {
        var thisObj = this;
        var elem = thisObj.getContainer();
        var widgetBasePath = thisObj.getWidgetBasePath();
        var el = $("#login-container", elem)[0];
        /**
        * Get the current language.
        */
        const I18N = HttpUtils.getI18n({
            locale: HttpUtils.getLocale(),
            messages: thisObj.getMessages()
        });
        let lang = I18N.messages[I18N.locale];

        var rules = {
            userName: [{
                required: true,
                message: lang.enterUsername,
                trigger: 'blur'
            }],
            password: [{
                required: true,
                message: lang.enterPassword,
                trigger: 'blur'
            }],
            captcha: [{
                required: true,
                message: lang.enterTheVerificationCode,
                trigger: 'blur'
            }]
        };
        /**
        * Creating a vue instance.
        */
        thisObj.vm = new Vue({
            el: el,
            data: {
                lang: lang,         //Current language.
                bg1: '',            //Background image.
                bg2: '',            //Background image.
                bg3: '',            //Background image.
                logo: '',           //Logo image.
                isAgreePrivacyStatement: false,  //Check whether the current account has signed the privacy statement. 
                promtDialogVisible: false,       // Check whether show promt dialog.
                bindDialogVisible: false,        // Check whether show bind third-party login account dialog.
                ruleForm: {                      // Bidirectional binding of input on login page.
                    userName: '',
                    password: '',
                    captcha: ''
                },
                bindForm: {                      // Bidirectional binding of input on third-party login account.
                    password: '',
                    captcha: ''
                },
                rules: rules,                   // Input rules on login page.
                needCaptcha: false,             // Check whether need captcha on login page.
                imgCode: '',                    // Image src of the captcha. 
                codeType: '',                   // Captcha category on login page.
                failTimesForCaptcha: -1,        // Captcha is required for login after the number of login failures exceeds the maximum.
                loginDurationForLockIdentity: -1,  // Login duration for identity lockout.
                systemTitle: '',                  // Login title from system parameters.
                unifiedPortalPage: '',            // LoginToPortalURL from system parameters.
                loginUrl: '',                     // UnifiedPortal_Mainframe_LoginUrl from  system parameters.
                subjectTypeCode: '',              // Subject type code from  system parameters.
                resetPasswordValidityPeriod: -1,    // Resetting the Password Validity Period .
                resetPasswordBeforeExpiredDays: -1,  // Number of days in advance users are notified that their passwords are to be reset. 
                loginOrPass: "login",               //  Switch login page and change password page.
                dataErr: {                          //  Check whether show error.
                    oriPsw: false,
                    psw: false,
                    rePsw: false
                },
                dataErrDesc: {                      // Error meesage content.
                    oriPsw: "",
                    psw: "",
                    rePsw: ""
                },
                acct: {                              // Bind input on change password page.
                    oriPsw: '',
                    psw: '',
                    rePsw: ''
                },
                userSetRule: {                      // Setting validate password rules on change password page.
                    psw_minLen: null,
                    psw_maxLen: null,
                    psw_UpLett: false,
                    psw_LowLett: false,
                    psw_Num: false,
                    psw_SpecCharc: false,
                    psw_RepeatCharts: null,
                    psw_lenStr: '',
                    psw_ruleStr: ''
                },
                dialogVisible: false,                   // Check whether show go to change password dialog after signed the privacy statement.
                dialogAutoClose: false,                  // Close go to change password dialog.
                messageBoxImg: widgetBasePath + 'image/ico_Warning_MessageBox.png',  // go to change password dialog box image src.
                descInfo: '',                              // The desc of go to change password dialog.
                identityId: '',
                canSkip: false,                            // Check whether could skip change password page.
                failTimesSelf: 0,                          // Login failed times. 
                iamToken: '',                              // IAM token.
                ssoAppId: '',                               // SystemManagement_SingleSignOnAppId from system parameters.
                ssoUrlPrefix: '',                            // SystemManagement_SingleSignOnHost from system parameters.
                currentLoginMode: '',                        // Current login mode.
                defaultLanguage: '',                          // DefaultLanguage from system parameters .
                isInitialFinished: false,                    // Check whether finished init phase. 
                isGetObjectStorageProxy: false,              // When it's true that successful get object storage proxy path.
                isGetSubjectTypeSetting: false,               // When it's true that successful get subject type setting .
                isGetSystemParameter: false,                  // When it's true that successful system paramter.
                isGetSystemImageParameter: false,              // When it's true that successful get login image src.
                publicObjectStorageProxy: '',                 // PublicObjectStorageProxy from system parameters.
                browserTitle: '',                             // UnifiedPortal_BrowserTitle from system parameters. 
                browserTitle_En: '',                          // UnifiedPortal_BrowserTitle_En from system parameters. 
                broswerShow: false,                           // Check whether show broswer compatibility popup.
                authorizeCode: '',                            // OauthCode from window location code.
                notAutoLogin: false,                          // Show login dialog ,check is auto login.
                hasLogin: false,                              // Whether user is login.
                obsPrefix: '',                                // Obs proxy path.
                oauthInfoList: [],                            // Oauth information list.
                isOauthLogin: false,                          // Whether login type is oauth login.
                thirdPartyLoginAccount: '',                   // ThirdPartyLoginAccount.
                isBind: false,                                // Operator whether bind thirdPartyAccount.
                verificationId: '',                           // Verification certificate for password change.
                privacyTitle: '',                             // Privacy title
                redirectUrl: '',                              // The redirect url after login success.
                redirectUrlRules: '',                         // Redirect url regex.
                redirectUrlError: false                       // Whether redirect url is illegal.
            },

            /**
            * Initializing data. 
            */
            created() {
                let _this = this;
                let identityId = _this.verifyLogin();
                let isChangedPassword = localStorage.getItem("SM_IsChangedPassword");
                _this.getQueryVariable();
                if (identityId) {
                    _this.getSystemParameter();
                    _this.verifyRedirectUrl();
                    if (!_this.unifiedPortalPage) {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                        return;
                    }
                    if (isChangedPassword == "false") {
                        _this.notAutoLogin = true;
                    } else {
                        _this.hasLogin = true;
                        location.href = _this.unifiedPortalPage;
                        return;
                    }
                }
                _this.refreshToken();
                _this.getSystemParameter();
                _this.verifyRedirectUrl();
                let browserTitle = I18N.locale == "zh-CN" ? _this.browserTitle : _this.browserTitle_En;
                _this.getBrowserInfo(browserTitle);
                _this.animation();
                let subjectTypeCode = "SmartCampus__SystemManagement/1.0.0/getSubjectTypeSettings?subjectTypeCode=" + _this.subjectTypeCode;
                _this.callAPIConn(subjectTypeCode, {}, _this.callSettingBack, null, "GetAPIConnector");
                _this.getThirdPartyInfo();
                // When failTimesTotal number over than failTimesForCaptcha need verify code login.
                let failTimesTotal = localStorage.getItem("LoginFailTotalTimes") || "0";
                if (failTimesTotal && Number(failTimesTotal) >= _this.failTimesForCaptcha && _this.failTimesForCaptcha > 0) {
                    _this.needCaptcha = true;
                    _this.getVerifyCode();
                }
                localStorage.setItem("SM_CurrentLoginPage", _this.loginOrPass);
                let privacyLaguage = I18N.locale == "zh-CN" ? "zh_CN" : "en_US";
                let privacyUrl = "SmartCampus__SystemManagement/1.0.0/getPrivacyStatementDetail?type=PC&language=" + privacyLaguage;
                _this.callAPIConn(privacyUrl, {}, _this.callPrivacyBack, null, "GetAPIConnector");
                _this.isInitialFinished = _this.isGetObjectStorageProxy && _this.isGetSubjectTypeSetting && _this.isGetSystemParameter && _this.isGetSystemImageParameter;
                if (!!window.ActiveXObject || "ActiveXObject" in window || window.document.documentMode) {
                    //DocumentMode: IE的私有属性，在IE8+中被支持。
                    _this.broswerShow = true;
                    return false;
                }
            },
            mounted: function () {
                let _this = this;
                if (_this.authorizeCode) {
                    _this.executeOauthLogin();
                } else if (!_this.hasLogin) {
                    _this.notAutoLogin = true;
                }
            },
            methods: {
                refreshToken() {
                    let _this = this;
                    _this.callAjax("/magno/render/site/auth", "GET", false, {}, { "CatalogName": STUDIO_DATA.catalogName, "CatalogVersion": STUDIO_DATA.version }, (re) => { HttpUtils.getCsrfToken(); });
                },
                /**
                * Get basic system parameters of the Smart Campus. 
                */
                getSystemParameter() {
                    let _this = this;
                    let parameterBasicList = {
                        paraNameList: [
                            "LoginTitle",
                            "LoginToPortalURL",
                            "SubjectTypeCode",
                            "UnifiedPortal_Mainframe_LoginUrl",
                            "SystemManagement_SingleSignOnHost",
                            "SystemManagement_SingleSignOnAppId",
                            "DefaultLanguage",
                            "SystemManagement_LoginMode",
                            "PublicObjectStorageProxy",
                            "UnifiedPortal_BrowserTitle",
                            "UnifiedPortal_BrowserTitle_En",
                            "SystemManagement_RedirectUrlRules"
                        ]
                    };
                    _this.callAPIConn("SmartCampus__SystemManagement/1.0.0/getSCBasicSystemParameter", parameterBasicList, _this.callSystemBasicBack, null, "PostAPIConnector");
                    let parameterImageList = {
                        paraNameList: [
                            "LoginLogo",
                            "LoginBackground1",
                            "LoginBackground2",
                            "LoginBackground3"
                        ]
                    };
                    _this.callAPIConn("SmartCampus__SystemManagement/1.0.0/getSCBasicSystemParameter", parameterImageList, _this.callSystemImageBack, null, "PostAPIConnector");
                },
                /**
                * Verify redirect url. 
                */
                verifyRedirectUrl() {
                    var _this = this;
                    if (_this.redirectUrl) {
                        if (!_this.redirectUrlRules) {
                            _this.redirectUrlError = true;
                            _this.showTips(_this.lang.illegalRedirectUrl, "error");
                        } else {
                            let reg = new RegExp(_this.redirectUrlRules);
                            if (!reg.test(_this.redirectUrl)) {
                                _this.redirectUrlError = true;
                                _this.showTips(_this.lang.illegalRedirectUrl, "error");
                            } else {
                                _this.unifiedPortalPage = _this.redirectUrl;
                            }
                        }
                    }
                },
                /**
                * Get the third-party login account type. 
                */
                getThirdPartyInfo() {
                    var _this = this;
                    let customAccounts = "SmartCampus__SystemManagement/1.0.0/getCustomAccountTypeDefinition";
                    _this.callAPIConn(customAccounts, { start: 0, limit: 20 }, _this.callCustomListBack, null, "PostAPIConnector");
                },
                getBrowserInfo(title) {
                    //动态修改浏览器title
                    $("head title").html(title);
                },
                /**
                * Go to forget password page. 
                */
                forgetPassword: function () {
                    thisObj.triggerEvent("GoToForgetPassword");
                },
                /**
                * Cancel privacy statement. 
                */
                cancelAgree() {
                    var _this = this;
                    _this.promtDialogVisible = false;
                    _this.isAgreePrivacyStatement = false;
                },
                /**
                * Execute login or oauth login after signed privacy statement. 
                */
                sign() {
                    var _this = this;
                    if (_this.isAgreePrivacyStatement) {
                        _this.promtDialogVisible = false;
                        if (_this.isOauthLogin) {
                            if (_this.isBind) {
                                _this.executeBind();
                            } else {
                                _this.executeOauthLogin();
                            }
                        } else {
                            _this.login("loginForm");
                        }
                    } else {
                        _this.showTips(_this.lang.pleaseAgreeToTheSmart + _this.privacyTitle, "warn");
                    }
                },
                /**
                * Cancel operator bind third-party account. 
                */
                cancelBind() {
                    var _this = this;
                    _this.bindDialogVisible = false;
                },
                /**
                * Operator bind third-party account. 
                */
                bind(bindForm) {
                    this.$refs[bindForm].validate((valid) => {
                        if (valid) {
                            this.executeBind();
                        } else {
                            return false;
                        }
                    });
                },
                /**
                * Execute operator bind third-party account. 
                */
                executeBind() {
                    var _this = this;
                    _this.isBind = true;
                    var request = {
                        loginAccount: _this.thirdPartyLoginAccount,
                        credential: _this.bindForm.password,
                        captchaCredential: _this.isAgreePrivacyStatement ? '' : _this.bindForm.captcha,
                        isAgreePrivacyStatement: _this.isAgreePrivacyStatement,
                        thirdPartyAccount: {
                            accountType: localStorage.getItem("SM_CurrentOauthType"),
                            oauthCode: _this.authorizeCode
                        }
                    };
                    _this.callAPIConn('SmartCampus__SystemManagement/1.0.0/thirdPartyLoginBindOperator', request, _this.callSSOLoginBack, null, "PostAPIConnector");
                },
                /**
                * Change isAgreePrivacyStatement value. 
                */
                changeAgree() {
                    var _this = this;
                    _this.isAgreePrivacyStatement = !_this.isAgreePrivacyStatement;
                },
                /**
                * Get verify code value. 
                */
                getVerifyCode() {
                    var _this = this;
                    _this.imgCode = '/u-route/baas/sys/v1.0/verificationcode?type=' + _this.codeType + '&t=' + Date.parse(new Date());
                },
                /**
                * verify Login.
                */
                verifyLogin() {
                    var _this = this;
                    let identityId = "";
                    _this.callAPIConn("SmartCampus__UnifiedPortal/1.0.0/verifyLogin", {}, (res) => {
                        if (res.resp.code == '0' && res.data[0].identityId) {
                            identityId = res.data[0].identityId || '';
                        }
                    }, null, "PostAPIConnector");
                    return identityId;
                },
                /**
                * Execute login after pass validate input parameter.
                */
                login(formName) {
                    this.$refs[formName].validate((valid) => {
                        if (valid) {
                            this.executeLogin();
                        } else {
                            return false;
                        }
                    });
                },
                /**
                * Execute login.
                */
                executeLogin() {
                    var _this = this;
                    _this.isOauthLogin = false;
                    if (!_this.unifiedPortalPage || !_this.isInitialFinished) {
                        _this.showTips(_this.lang.systemError, "error");
                        return;
                    }
                    if (_this.redirectUrlError) {
                        _this.showTips(_this.lang.illegalRedirectUrl, "error");
                        return;
                    }
                    var request = {
                        loginAccount: (_this.ruleForm.userName || '').trim(),
                        credential: _this.ruleForm.password,
                        captchaCredential: _this.isAgreePrivacyStatement ? '' : _this.ruleForm.captcha,
                        isAgreePrivacyStatement: _this.isAgreePrivacyStatement
                    };
                    _this.isAgreePrivacyStatement = false;
                    _this.callAPIConn('SmartCampus__SystemManagement/1.0.0/system/login', request, _this.callLoginBack, null, "PostAPIConnector");
                },
                /**
                * Execute oauth login.
                */
                executeOauthLogin() {
                    var _this = this;
                    _this.isOauthLogin = true;
                    if (!_this.unifiedPortalPage || !_this.isInitialFinished) {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                        return;
                    }
                    if (_this.redirectUrlError) {
                        _this.showTips(_this.lang.illegalRedirectUrl, "error");
                        return;
                    }
                    let accountType = localStorage.getItem("SM_CurrentOauthType");
                    if (!accountType) {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                        return;
                    }
                    var request = {
                        oauthCode: _this.authorizeCode,
                        accountType: accountType,
                        isAgreePrivacyStatement: _this.isAgreePrivacyStatement
                    };
                    _this.callAPIConn('SmartCampus__SystemManagement/1.0.0/oauthLogin', request, _this.callSSOLoginBack, null, "PostAPIConnector");
                },
                /**
                * Callback of executeLogin().
                */
                callLoginBack: function (response, event) {
                    var _this = this;
                    if (response.resp.code) {
                        if (response.resp.code == '0' && response.data && response.data[0] && response.data[0].loginResult) {
                            if (response.data[0].loginResult.IdentityID) {
                                HttpUtils.getCsrfToken();
                                _this.iamToken = event.getResponseHeader("Iamtoken");
                                localStorage.removeItem("LoginFailTotalTimes");
                                _this.needCaptcha = false;
                                _this.ruleForm.captcha = '';
                                _this.identityId = response.data[0].loginResult.IdentityID;
                                _this.verificationId = response.data[0].loginResult.verificationId;
                                // Check whether could skip the change password page.
                                if ((!response.data[0].loginResult.isChangedPassword && _this.resetPasswordValidityPeriod <= 0) ||
                                    (!response.data[0].loginResult.isChangedPassword && _this.resetPasswordValidityPeriod > 0 &&
                                        response.data[0].loginResult.passwordValidRemainDays > _this.resetPasswordBeforeExpiredDays)) {
                                    _this.dialogVisible = true;
                                    _this.descInfo = _this.lang.toEnsureAccountSecurityChangeThePassword;
                                    _this.canSkip = false;
                                    localStorage.setItem("SM_IsChangedPassword", false);
                                } else if (_this.resetPasswordValidityPeriod > 0 && response.data[0].loginResult.passwordValidRemainDays != 0 &&
                                    response.data[0].loginResult.passwordValidRemainDays <= _this.resetPasswordBeforeExpiredDays) {
                                    _this.dialogVisible = true;
                                    _this.descInfo = _this.lang.yourPasswordIsStillValid + response.data[0].loginResult.passwordValidRemainDays + _this.lang.daysToEnsureAccountSecurity;
                                    _this.canSkip = true;
                                } else if (_this.resetPasswordValidityPeriod > 0 && response.data[0].loginResult.passwordValidRemainDays == 0) {
                                    _this.dialogVisible = true;
                                    _this.descInfo = _this.lang.yourPasswordHasExpired;
                                    _this.canSkip = false;
                                    localStorage.setItem("SM_IsChangedPassword", false);
                                } else {
                                    _this.afterLogin();
                                }
                            } else {
                                // Add LoginFailTotalTimes time.
                                _this.getVerifyCode();
                                _this.showTips(_this.lang.systemError, "error");
                                let failTimes = 0;
                                let failTimesTotal = localStorage.getItem("LoginFailTotalTimes") || "0";
                                _this.failTimesSelf++;
                                failTimes = Number(failTimesTotal);
                                failTimes++;
                                localStorage.setItem("LoginFailTotalTimes", failTimes);
                                if (failTimes >= _this.failTimesForCaptcha && _this.failTimesForCaptcha > 0) {
                                    _this.needCaptcha = true;
                                }
                            }
                        } else {
                            // Add LoginFailTotalTimes time. 
                            _this.getVerifyCode();
                            _this.showTips(_this.lang.systemError, "error");
                            let failTimes = 0;
                            let failTimesTotal = localStorage.getItem("LoginFailTotalTimes") || "0";
                            _this.failTimesSelf++;
                            failTimes = Number(failTimesTotal);
                            failTimes++;
                            localStorage.setItem("LoginFailTotalTimes", failTimes);
                            if (failTimes >= _this.failTimesForCaptcha && _this.failTimesForCaptcha > 0) {
                                _this.needCaptcha = true;
                            }
                        }
                    }
                },
                /**
                * Callback of executeOauthLogin().
                */
                callSSOLoginBack: function (response) {
                    var _this = this;
                    if (response.resp.code) {
                        if (response.resp.code == '0' && response.data && response.data[0]) {
                            if (response.data[0].identityId) {
                                HttpUtils.getCsrfToken();
                                localStorage.removeItem("LoginFailTotalTimes");
                                _this.identityId = response.data[0].identityId;
                                _this.afterLogin();
                            } else {
                                _this.notAutoLogin = true;
                                _this.showTips(_this.lang.systemError, "error");
                            }
                        } else {
                            _this.notAutoLogin = true;
                            _this.showTips(_this.lang.systemError, "error");
                        }
                    }
                },
                /**
                * Deal with data after execute login callback .
                */
                afterLogin: function () {
                    var _this = this;
                    _this.handleLocale();
                    sessionStorage.setItem('IdentityId', _this.identityId); //将IdentityId存到SessionStorage.
                    localStorage.setItem('IdentityId', _this.identityId); //将IdentityId存到LocalStorage.
                    _this.dialogVisible = false;
                    let parameterList = {
                        paraNameList: ["SystemManagement_LoginMode"]
                    };
                    _this.callAPIConn("SmartCampus__SystemManagement/1.0.0/getSCBasicSystemParameter", parameterList, _this.callSystemLoginModeBack, null, "PostAPIConnector");
                    if (_this.iamToken && _this.ssoUrlPrefix && _this.ssoAppId && _this.currentLoginMode == "IAM") {
                        let setCookieUrl = encodeURI(_this.ssoUrlPrefix + '/idp/restful/setIDPCookie?appId=' + _this.ssoAppId + '&tokenId=' + _this.iamToken + '&remoteIp=null');
                        _this.callJsonpAjax(setCookieUrl);
                    } else if (_this.currentLoginMode != "IAM") {
                        localStorage.setItem('SM_CurrentLoginMode', _this.currentLoginMode);
                        location.href = _this.unifiedPortalPage;
                    } else {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                    }
                },
                /**
                * Callback of getSubjectTypeSettings, init getSubjectTypeSettings data value.
                */
                callSettingBack: function (response) {
                    var _this = this;
                    if (response.resp.code) {
                        if (response.resp.code == '0' && response.data && response.data[0]) {
                            if (response.data[0].length != 0) {
                                let resp = response.data[0];
                                _this.codeType = resp.loginCaptchaCategory || '';
                                _this.failTimesForCaptcha = resp.loginFailTimesForCaptcha || -1;
                                _this.loginDurationForLockIdentity = resp.loginDurationForLockIdentity || -1;
                                _this.resetPasswordValidityPeriod = resp.resetPasswordValidityPeriod || -1;
                                _this.resetPasswordBeforeExpiredDays = resp.resetPasswordBeforeExpiredDays || -1;
                                _this.userSetRule.psw_minLen = resp.resetPasswordMinLength > 0 ? resp.resetPasswordMinLength : 0;
                                _this.userSetRule.psw_maxLen = resp.resetPasswordMaxLength > 0 ? resp.resetPasswordMaxLength : 0;
                                _this.userSetRule.psw_UpLett = resp.resetPasswordUppercaseLetterRequired;
                                _this.userSetRule.psw_LowLett = resp.resetPasswordLowercaseLetterRequired;
                                _this.userSetRule.psw_Num = resp.resetPasswordNumberRequired;
                                _this.userSetRule.psw_SpecCharc = resp.resetPasswordSpecialCharacterRequired;
                                _this.userSetRule.psw_RepeatCharts = resp.resetPasswordMinNotRepeatCharts > 0 ? resp.resetPasswordMinNotRepeatCharts : 0;
                                _this.isGetSubjectTypeSetting = true;
                                if (_this.userSetRule.psw_minLen || _this.userSetRule.psw_maxLen) {
                                    if (_this.userSetRule.psw_minLen) _this.userSetRule.psw_lenStr = _this.lang.theMinimumLengthIs + _this.userSetRule.psw_minLen + _this.lang.digits;
                                    if (_this.userSetRule.psw_minLen && _this.userSetRule.psw_maxLen) _this.userSetRule.psw_lenStr += ', ';
                                    if (_this.userSetRule.psw_maxLen) _this.userSetRule.psw_lenStr += _this.lang.theMaximumLengthIs + _this.userSetRule.psw_maxLen + _this.lang.digits;
                                }
                                if (_this.userSetRule.psw_UpLett || _this.userSetRule.psw_LowLett || _this.userSetRule.psw_Num || _this.userSetRule.psw_SpecCharc) {
                                    _this.userSetRule.psw_ruleStr = _this.lang.atLeast;
                                    if (_this.userSetRule.psw_UpLett) _this.userSetRule.psw_ruleStr += _this.lang.uppercaseLetters;
                                    if (_this.userSetRule.psw_UpLett && (_this.userSetRule.psw_LowLett || _this.userSetRule.psw_Num || _this.userSetRule.psw_SpecCharc)) {
                                        _this.userSetRule.psw_ruleStr += ', ';
                                    }
                                    if (_this.userSetRule.psw_LowLett) _this.userSetRule.psw_ruleStr += _this.lang.lowercaseLetters;
                                    if (_this.userSetRule.psw_LowLett && (_this.userSetRule.psw_Num || _this.userSetRule.psw_SpecCharc)) {
                                        _this.userSetRule.psw_ruleStr += ', ';
                                    }
                                    if (_this.userSetRule.psw_Num) _this.userSetRule.psw_ruleStr += _this.lang.digit;
                                    if (_this.userSetRule.psw_Num && _this.userSetRule.psw_SpecCharc) {
                                        _this.userSetRule.psw_ruleStr += ', ';
                                    }
                                    if (_this.userSetRule.psw_SpecCharc) _this.userSetRule.psw_ruleStr += _this.lang.specialCharacters;
                                }
                            }
                        }
                    } else {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                    }
                },
                /**
                * Callback of getPrivacyStatement, init getPrivacyStatement data value.
                */
                callPrivacyBack: function (response) {
                    var _this = this;
                    if (response.resp.code) {
                        if (response.resp.code == '0' && response.data) {
                            _this.privacyTitle = response.data.name;
                        }
                    } else {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                    }
                },
                /**
                * Callback of getCustomAccountTypeDefinition, init oauthInfoList value.
                */
                callCustomListBack: function (response) {
                    var _this = this;
                    if (response && response.resp.code == '0') {
                        if (response.data && response.data.loginAccountDefinitions && response.data.loginAccountDefinitions.length) {
                            let loginAccountType = response.data.loginAccountDefinitions;
                            (loginAccountType || []).forEach(accountType => {
                                if (accountType.name != 'IAM') {
                                    let setting = accountType.setting;
                                    let logo = '';
                                    if (setting.logo && setting.logo.length) {
                                        let logoJson = JSON.parse(setting.logo);
                                        logo = logoJson[0].url || '';
                                    }
                                    let oauthInfo = {
                                        baseUrl: setting.baseUrl,
                                        clientId: setting.clientId,
                                        redirectUrl: setting.redirectUrl,
                                        logo: logo,
                                        scope: setting.scope,
                                        accountType: accountType.name,
                                        loginUrl: setting.loginUrl
                                    };
                                    _this.oauthInfoList.push(oauthInfo);
                                }
                            });
                        }
                    } else {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                    }
                },
                /**
                * Go to privacy statement page.
                */
                viewPrivacy: function () {
                    if (I18N.locale == "en-US") {
                        thisObj.triggerEvent("GoToViewEnglishPrivacy");
                    }
                    if (I18N.locale == "zh-CN") {
                        thisObj.triggerEvent("GoToViewPrivacy");
                    }
                },
                /**
                * Callback of getSCBasicSystemParameter, init getSCBasicSystemParameter data value.
                */
                callSystemBasicBack: function (response) {
                    var _this = this;
                    if (response && response.resp.code == '0') {
                        if (response.data && response.data.length) {
                            for (var res of response.data[0].paraValueList) {
                                if (res.name == 'LoginTitle') {
                                    _this.systemTitle = res.value || '';
                                } else if (res.name == 'LoginToPortalURL') {
                                    _this.unifiedPortalPage = res.value || '';
                                } else if (res.name == "SubjectTypeCode") {
                                    _this.subjectTypeCode = res.value || 'operator';
                                } else if (res.name == "UnifiedPortal_Mainframe_LoginUrl") {
                                    _this.loginUrl = res.value || '';
                                    localStorage.setItem('RedirectLoginUrl', _this.loginUrl);
                                } else if (res.name == "SystemManagement_SingleSignOnHost") {
                                    _this.ssoUrlPrefix = res.value || '';
                                } else if (res.name == "SystemManagement_SingleSignOnAppId") {
                                    _this.ssoAppId = res.value || '';
                                } else if (res.name == "DefaultLanguage") {
                                    _this.defaultLanguage = res.value || '';
                                } else if (res.name == "PublicObjectStorageProxy") {
                                    _this.publicObjectStorageProxy = res.value || '';
                                } else if (res.name == "SystemManagement_LoginMode") {
                                    _this.currentLoginMode = res.value || '';
                                } else if (res.name == "UnifiedPortal_BrowserTitle") {
                                    _this.browserTitle = _this.lang.logIn + '-' + res.value;
                                } else if (res.name == "UnifiedPortal_BrowserTitle_En") {
                                    _this.browserTitle_En = _this.lang.logIn + '-' + res.value;
                                } else if (res.name == "SystemManagement_RedirectUrlRules") {
                                    _this.redirectUrlRules = res.value;
                                }
                            }
                            _this.isGetSystemParameter = true;
                        }
                    } else {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                    }
                },
                /**
                * Callback of getSCBasicSystemParameter, init login background data value.
                */
                callSystemImageBack: function (response) {
                    var _this = this;
                    if (response && response.resp.code == '0') {
                        if (response.data && response.data.length) {
                            _this.callAPIConn("SmartCampus__UnifiedPortal/1.0.0/getObjectStorageProxy?" + "objectStorageProxyName=" + _this.publicObjectStorageProxy, {}, (proxyRes) => {
                                if (proxyRes.resp.code == '0' && proxyRes.data && proxyRes.data.length) {
                                    _this.obsPrefix = proxyRes.data[0].urlPrefix;
                                    _this.isGetObjectStorageProxy = true;
                                }
                            }, null, "GetAPIConnector");
                            for (var res of response.data[0].paraValueList) {
                                if (res.name == "LoginLogo") {
                                    _this.logo = _this.obsPrefix + res.value || '';
                                } else if (res.name == "LoginBackground1") {
                                    _this.bg1 = _this.obsPrefix + res.value || '';
                                } else if (res.name == "LoginBackground2") {
                                    _this.bg2 = _this.obsPrefix + res.value || '';
                                } else if (res.name == "LoginBackground3") {
                                    _this.bg3 = _this.obsPrefix + res.value || '';
                                }
                            }
                            _this.isGetSystemImageParameter = true;
                        }
                    } else {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                    }
                },
                /**
                * Callback of getSCBasicSystemParameter, init SystemManagement_LoginMode data value.
                */
                callSystemLoginModeBack: function (response) {
                    var _this = this;
                    if (response && response.resp.code == '0') {
                        if (response.data && response.data.length != 0) {
                            for (var res of response.data[0].paraValueList) {
                                if (res.name == "SystemManagement_LoginMode") {
                                    _this.currentLoginMode = res.value || '';
                                }
                            }
                        }
                    } else {
                        _this.notAutoLogin = true;
                        _this.showTips(_this.lang.systemError, "error");
                    }
                },
                /**
                * Go to validate oauth page.
                */
                goOauthValidate: function (accountType) {
                    var _this = this;
                    (_this.oauthInfoList || []).forEach(oauth => {
                        if (oauth.accountType == accountType) {
                            localStorage.setItem("SM_CurrentOauthType", accountType);
                            let defaultUrl = oauth.baseUrl + "authorize?client_id=" + oauth.clientId + "&response_type=code&redirect_uri=" + oauth.redirectUrl + "&scope=" + oauth.scope;
                            location.href = oauth.loginUrl || defaultUrl;
                        }
                    });
                },
                /**
                * Query parameter from window location.
                */
                getQueryVariable: function () {
                    var _this = this;
                    var query = window.location.search.substring(1);
                    var vars = query.split("&");
                    for (var i = 0; i < vars.length; i++) {
                        var pair = vars[i].split("=");
                        if (pair[0] == 'code') { _this.authorizeCode = pair[1]; }
                        if (pair[0] == 'redirectUrl') { _this.redirectUrl = pair[1]; }
                    }
                },
                /**
                * Go to change password page.
                */
                changePassword() {
                    var _this = this;
                    _this.dialogVisible = false;
                    _this.loginOrPass = 'password';
                    localStorage.setItem("SM_CurrentLoginPage", _this.loginOrPass);
                    _this.acct.oriPsw = '';
                    _this.acct.psw = '';
                    _this.acct.rePsw = '';
                    _this.dataErr = {
                        oriPsw: false,
                        psw: false,
                        rePsw: false
                    };
                    _this.dataErrDesc = {
                        oriPsw: "",
                        psw: "",
                        rePsw: ""
                    };
                },
                /**
                * Validate psw input and rePsw input rule.
                */
                onBlur(key, value) {
                    var _this = this;
                    switch (key) {
                        case 'psw':
                            if (value) {
                                let pswRule = this.userSetRule;
                                if (pswRule.psw_minLen && value.length < pswRule.psw_minLen) {
                                    this.dataErr[key] = true;
                                    this.dataErrDesc[key] = _this.lang.enterAtLeast + pswRule.psw_minLen + _this.lang.characters;
                                    return false;
                                }
                                if (pswRule.psw_maxLen && value.length > pswRule.psw_maxLen) {
                                    this.dataErr[key] = true;
                                    this.dataErrDesc[key] = _this.lang.thePasswordCanContainMaximumOf + pswRule.psw_maxLen + _this.lang.characters;
                                    return false;
                                }
                                if (pswRule.psw_UpLett) {
                                    var regExp1 = /(?=.*?[A-Z])/;
                                    var result1 = (regExp1.test(value)) ? true : false;
                                    if (!result1) {
                                        this.dataErr[key] = true;
                                        this.dataErrDesc[key] = _this.lang.containAtLeastOneUppercase;
                                        return false;
                                    }
                                }
                                if (pswRule.psw_LowLett) {
                                    var regExp2 = /(?=.*?[a-z])/;
                                    var result2 = (regExp2.test(value)) ? true : false;
                                    if (!result2) {
                                        this.dataErr[key] = true;
                                        this.dataErrDesc[key] = _this.lang.containAtLeastOneLowercase;
                                        return false;
                                    }
                                }
                                if (pswRule.psw_Num) {
                                    var regExp3 = /(?=.*\d)/;
                                    var result3 = (regExp3.test(value)) ? true : false;
                                    if (!result3) {
                                        this.dataErr[key] = true;
                                        this.dataErrDesc[key] = _this.lang.containAtLeastOneDigit;
                                        return false;
                                    }
                                }
                                //判断两次密码输入                                
                                if (value == this.acct.rePsw) {
                                    this.dataErr.rePsw = false;
                                    this.dataErrDesc.rePsw = "";
                                } else if (this.acct.rePsw && value != this.acct.rePsw) {
                                    this.dataErr.rePsw = true;
                                    this.dataErrDesc.rePsw = _this.lang.thePasswordMustBeTheSame;
                                    return false;
                                }
                            }
                            break;
                        case 'rePsw':
                            if (value) {
                                if (this.acct.psw) {
                                    var result = (value == this.acct.psw) ? true : false;
                                    if (!result) {
                                        this.dataErr[key] = true;
                                        this.dataErrDesc[key] = _this.lang.thePasswordMustBeTheSame;
                                        return false;
                                    } else {
                                        this.dataErr[key] = false;
                                        this.dataErrDesc[key] = "";
                                    }
                                }
                            }
                            break;
                        default:
                            break;
                    }
                },
                /**
                * Bind input error meesage on change password page.
                */
                onInput(key) {
                    this.dataErr[key] = false;
                    this.dataErrDesc[key] = "";
                },
                /**
                * Cancel or save event handling on change password page.
                */
                handleUserset(type) {
                    var _this = this;
                    if (type == "cancel") {
                        _this.loginOrPass = "login";
                        localStorage.setItem("SM_CurrentLoginPage", _this.loginOrPass);
                    } else {
                        if (_this.dataErr.oriPsw || _this.dataErr.psw || _this.dataErr.rePsw) {
                            return false;
                        }
                        if (!_this.acct.oriPsw) {
                            _this.dataErr.oriPsw = true;
                            _this.dataErrDesc.oriPsw = _this.lang.enterTheOldPassword;
                            return false;
                        }
                        if (!_this.acct.psw) {
                            _this.dataErr.psw = true;
                            _this.dataErrDesc.psw = _this.lang.enterPassword;
                            return false;
                        }
                        if (!_this.acct.rePsw) {
                            _this.dataErr.rePsw = true;
                            _this.dataErrDesc.rePsw = _this.lang.pleaseConfirmThePassword;
                            return false;
                        }
                        if (_this.acct.rePsw != _this.acct.psw) {
                            _this.dataErr.rePsw = true;
                            _this.dataErrDesc.rePsw = _this.lang.theTwoPasswordMustBeTheSame;
                            return false;
                        }
                        //调接口(修改密码)
                        let pswReq = {
                            "verificationId": _this.verificationId,
                            "oldPassword": _this.acct.oriPsw,
                            "newPassword": _this.acct.psw
                        };
                        _this.callAPIConn("SmartCampus__SystemManagement/1.0.0/changePassword", pswReq, (res) => {
                            if (res.resp.code == '0') {
                                _this.showTips(_this.lang.passwordChangedSuccessfully, "success");
                                localStorage.setItem("SM_IsChangedPassword", true);
                                _this.loginOrPass = "login";
                                localStorage.setItem("SM_CurrentLoginPage", _this.loginOrPass);
                                _this.oauthInfoList = [];
                                _this.getThirdPartyInfo();
                            } else {
                                _this.showTips(res.resp.message, "error");
                            }
                        }, null, "PostAPIConnector");
                    }
                },
                showTips(msg, type, duration) {
                    this.$message({
                        message: msg,
                        type: type || '',
                        customClass: 'hw-message',
                        duration: duration || 3000
                    });
                },
                /**
                * Deal with internationalization.
                */
                handleLocale() {
                    var _this = this;
                    var currLocale = '';
                    if (!window.localStorage.getItem('locale')) {
                        currLocale = _this.defaultLanguage ? _this.defaultLanguage : navigator.language ? navigator.language : navigator.userLanguage;
                    } else {
                        currLocale = window.localStorage.getItem('locale') || '';
                    }
                    currLocale = -1 != currLocale.indexOf('zh') ? 'zh_CN' : (-1 != currLocale.indexOf('en') ? 'en_US' : 'zh_CN');
                    window.localStorage.setItem('locale', currLocale);
                    _this.callAjax('/u-route/baas/sys/v1.0/changelocale', 'POST', false, {
                        languageLocaleKey: currLocale
                    }, null, function (res) {
                        if (res.resCode != '0') {
                            _this.notAutoLogin = true;
                            _this.showTips(_this.lang.systemError, "error");
                        }
                    });
                },
                /**
                * Encapsulation ajax request with prevents csrf attack.
                */
                callAjax: function (url, type, syncFlag, request, header, callFunc) {
                    var _this = this;
                    HttpUtils.getCsrfToken(function (token) {
                        header = header ? header : {};
                        header["Content-Type"] = "application/json";
                        header["csrf-token"] = token;
                        $.ajax({
                            url: url,
                            type: type,
                            headers: header,
                            async: syncFlag,
                            data: JSON.stringify(request) == '{}' ? '' : JSON.stringify(request),
                            success: callFunc,
                            error: function (error) {
                                let res = JSON.parse(error.responseText);
                                _this.showTips(res.resMsg, "error");
                            }
                        });
                    });
                },
                /**
                * Encapsulation ajax request with prevents csrf attack,set loaclStorage SM_CurrentLoginMode value, entry unifiedPortal page.
                */
                callJsonpAjax: function (url) {
                    var _this = this;
                    HttpUtils.getCsrfToken(function (token) {
                        $.ajax({
                            url: url,
                            type: 'GET',
                            headers: {
                                "Content-Type": "application/json",
                                "csrf-token": token
                            },
                            async: false,
                            dataType: "jsonp",
                            jsonp: "jsonpCallback",
                            success: function () {
                                localStorage.setItem('SM_CurrentLoginMode', _this.currentLoginMode);
                                location.href = _this.unifiedPortalPage;
                            },
                            error: function () {
                                _this.showTips(_this.lang.systemError, "error");
                            }
                        });
                    });
                },
                /**
                * Check whether the browser supports a CSS3 attribute.
                */
                supportCss3(style) {
                    var prefix = ['webkit', 'Moz', 'ms', 'o'];
                    var i;
                    var humpString = [];
                    var htmlStyle = document.documentElement.style;
                    var _toHumb = function (string) {
                        return string.replace(/-(\w)/g, function ($0, $1) {
                            return $1.toUpperCase();
                        });
                    };
                    for (i in prefix) {
                        humpString.push(_toHumb(prefix[i] + '-' + style));
                    }
                    humpString.push(_toHumb(style));
                    for (i in humpString) {
                        if (humpString[i] in htmlStyle) return true;
                    }
                    return false;
                },
                /**
                * Animation for switching background images in rotation mode.
                */
                animation() {
                    var _this = this;
                    $('.passDiv').click(function () {
                        $(_this).addClass('ipnutHover').siblings().removeClass('ipnutHover');
                    });
                    // 如果支持animation
                    if (_this.supportCss3('animation')) {
                        _this.supportShow(0, 3);
                    } else {
                        _this.notSupportShow(0, 3);
                    }
                },
                /**
                * Using the CSS3 syntax to complete the rotation display.
                */
                supportShow(index, length) {
                    $('.login-img').eq(index).removeClass('fadein');
                    $('.login-img').eq(index).addClass('active').siblings('.active').removeClass('active');
                    if (index === length - 1) {
                        $('.login-img').eq(0).addClass('fadein');
                        this.int = setTimeout(() => {
                            this.supportShow(0, length);
                        }, 12000);
                        return;
                    } else {
                        $('.login-img').eq(index + 1).addClass('fadein');
                        this.int = setTimeout(() => {
                            this.supportShow(index + 1, length);
                        }, 12000);
                        return;
                    }
                },
                /**
                * Do not using the CSS3 syntax to complete the rotation display.
                */
                notSupportShow(index, length) {
                    $('.login-img').eq(length - 1).css({
                        zIndex: 2,
                        zoom: 1
                    });
                    $('.login-img').eq(index).css({
                        zoom: 1,
                        opacity: '1',
                        zIndex: '3'
                    });
                    $('.login-img').eq(index).animate({
                        zoom: 0.9
                    }, 10000, function () {
                        $(this).animate({
                            opacity: 0
                        }, 2000, function () {
                            $(this).css({
                                zoom: 1,
                                opacity: 0
                            });
                        });
                    });
                    if (index === length - 1) {
                        $('.login-img').eq(0).animate({
                            opacity: '1'
                        }, 10000);
                        this.int = setTimeout(() => {
                            this.notSupportShow(0, length);
                        }, 10000);
                        return;
                    } else {
                        $('.login-img').eq(index + 1).animate({
                            opacity: '1'
                        }, 10000);
                        this.int = setTimeout(() => {
                            this.notSupportShow(index + 1, length);
                        }, 10000);
                        return;
                    }
                },

                /**
                * 统一APIConnector调用.
                */
                callAPIConn: function (service, param, callbackFunc, method, flowName) {
                    var thisView = this;
                    var connector = thisObj.getConnectorInstanceByName(flowName);
                    if (connector) {
                        connector.setInputParams({
                            service: service,
                            needSchema: 'data',
                            async: false,
                            method: method
                        });
                        connector
                            .query(param)
                            .done(function (response, originalResponse) {
                                if (response.resp && response.resp.code) {
                                    callbackFunc.call(thisObj, response, originalResponse);
                                } else if (originalResponse && originalResponse.responseJSON) {
                                    callbackFunc.call(thisObj, originalResponse);
                                } else {
                                    thisView.notAutoLogin = true;
                                    thisView.showTips(thisView.lang.systemError, "error");
                                }
                            })
                            .fail(function (response) {
                                thisView.notAutoLogin = true;
                                if (thisView.loginOrPass == 'login') {
                                    if (response.status == "500") {
                                        if (response.response.resCode === "SmartCampus__SystemManagement.NeedBindLoginAccount") {
                                            thisView.bindDialogVisible = true;
                                            let resMsg = response.response.resMsg;
                                            thisView.thirdPartyLoginAccount = resMsg.match(/<(\S*)>/)[1];
                                        } else {
                                            thisView.getVerifyCode();
                                            if (thisView.isBind) {
                                                if (response.response.resCode === "ca_cm__Identity.LoginFail") {
                                                    thisView.showTips(thisView.lang.passwordError, "error");
                                                } else {
                                                    thisView.showTips(response.response.resMsg, "error");
                                                }
                                            } else {
                                                if (response.response.resCode != "SmartCampus__UnifiedPortal.OperatorLocked" && response.response.resCode != "SmartCampus__UnifiedPortal.OperatorSuspend" && response.response.resCode != "SmartCampus__UnifiedPortal.OperatorDeleted") {
                                                    thisView.showTips(response.response.resMsg, "error");
                                                }
                                            }
                                            let failTimesTotal = localStorage.getItem("LoginFailTotalTimes") || "0";
                                            thisView.failTimesSelf++;
                                            let failTimes = Number(failTimesTotal);
                                            failTimes++;
                                            localStorage.setItem("LoginFailTotalTimes", failTimes);
                                            if ((thisView.failTimesForCaptcha && failTimes >= thisView.failTimesForCaptcha && thisView.failTimesForCaptcha > 0) ||
                                                response.response.resCode == 'ca_cm__Identity.InvalidCaptcha' || response.response.resCode == 'ca_cm__Identity.NeedCaptcha') {
                                                thisView.needCaptcha = true;
                                            }
                                        }
                                    } else if (response.status == "400") {
                                        thisView.getVerifyCode();
                                        if (response.response.resCode === "ca_cm__NeedSignPrivacyStatement") {
                                            thisView.promtDialogVisible = true;
                                            return;
                                        } else if (response.response.resCode === "ca_cm__Identity.IdentityNotActive") {
                                            thisView.showTips(thisView.lang.theUserHasBeenDisabled, "error");
                                            return;
                                        } else if (response.response.resCode === "CM-001010") {
                                            thisView.showTips(response.response.resMsg, "error");
                                            return;
                                        }
                                        if (thisView.currentLoginMode == "IAM") {
                                            if (response.response.resCode == 'ca_cm__Identity.NoMatchAccount') {
                                                thisView.showTips(thisView.lang.loginFailedTheIAMUser, "error");
                                            } else {
                                                thisView.showTips(response.response.resMsg, "error");
                                            }
                                        } else if (thisView.currentLoginMode == "EmployeeNo") {
                                            thisView.showTips(response.response.resMsg, "error");
                                        }
                                    } else {
                                        thisView.getVerifyCode();
                                        thisView.showTips(thisView.lang.systemError, "error");
                                    }
                                } else if (thisView.loginOrPass == 'password') {
                                    thisView.showTips(response.response.resMsg, "error");
                                }
                            });
                    } else {
                        thisView.notAutoLogin = true;
                        thisView.showTips(thisView.lang.systemError, "error");
                    }
                },
            }
        });
    },

});