var HM_mainframe_widget = StudioWidgetWrapper.extend(
    {
        init: function () {
            var thisObj = this;
            thisObj._super.apply(thisObj, arguments);
            thisObj.render();
        },
        render: function () {
            var thisObj = this;
            var widgetBasePath = thisObj.getWidgetBasePath();
            var elem = thisObj.getContainer();
            if (elem) {
                var containerDiv = $(".scfClientRenderedContainer", elem);
                if (containerDiv.length) {
                    $(containerDiv).empty();
                } else {
                    containerDiv = document.createElement('div');
                    containerDiv.className = "scfClientRenderedContainer";
                    $(elem).append(containerDiv);
                }
                const i18n = HttpUtils.getI18n({
                    locale: HttpUtils.getLocale(),
                    messages: thisObj.getMessages()
                });
                let _lang = i18n.messages[i18n.locale] || i18n.messages["en_US"];
                let websocketHead = location.protocol === 'https:' ? 'wss://' : 'ws://';

                thisObj.vm = new Vue({
                    el: $('#unified-portal', elem)[0],
                    data: {
                        studioInReader: Studio.inReader,
                        menuList: [], screenHeight: '',
                        hoverIdx: null, hoverSubIdx: null, hoverSub2Idx: null, clicIdx: null, clicSubIdx: null, clicSub2Idx: null, clicSub3Idx: null,
                        iframeSrc: "", showIframe: false, framesUrl: '', isOpenNewTab: false, noRedirect: false, isIframeThird: false, contentWrap: '',
                        selArea: [], unSelArea: [], LocContVisible: false, selAreaTitle: '',
                        showContent: true, showPersonal: false, userTabSel: 'basic',
                        initUserPic: widgetBasePath + "image/user.png", loadImg: widgetBasePath + "image/loading1.gif",
                        userPicEdit: false, userPic: '', userPicFile: [], imgPrefix: '',
                        acct: { userPic: '', name: '', nickname: '', oriPsw: '', psw: '', rePsw: '' },
                        dataErr: { name: false, nickname: false, oriPsw: false, psw: false, rePsw: false },
                        dataErrDesc: { name: "", nickname: "", oriPsw: "", psw: "", rePsw: "" },
                        userSetRule: { psw_minLen: null, psw_maxLen: null, psw_UpLett: false, psw_LowLett: false, psw_Num: false, psw_SpecCharc: false, psw_RepeatCharts: null },
                        identityId: '', operatorId: '', userName: '',
                        sysParams: {
                            logoUrl: '', spaceLevelConf: '', multiLangConf: true, spaceAllow: true, loginUrl: '', spaceRootCode: '', subjectTypeCode: '',
                            defaultSelCode: '', ObjectStorageProxy: '', PublicObjectStorageProxy: '', ssoAppId: '', ssoUrlPrefix: '', defaultLanguage: '', copyRight: '',
                            browserTitle: '', alarmConf: false, alarmDuration: 5000, alarmContent: ''
                        },
                        locale: { selLocale: '中文', noSelLocale: '英文', noSelLang: 'en_US' },
                        showArea: false, switchAreaItem: false, bUrlHash: '', spLevList: [], selSpNode: {},
                        dialog: { dialogVisible: false, dialogAutoClose: false, setCloseTimer: null, descInfo: _lang.userSetting.basicInfo.drawer.abnormal },
                        about: { visible: false, packList: [], loading: true, title: '', overAllPackObj: {} },
                        opOrgSpRely: false, orgSpaceIdList: [], showMenuScroll: false,
                        upArrow: widgetBasePath + "image/up-arrow.png", downArrow: widgetBasePath + "image/down-arrow.png", fullScreenIcon: widgetBasePath + "image/icon-f.png",
                        fullScreen: false, lang: _lang, localeLang: i18n.locale,
                        websocketUrl: websocketHead + location.host + "/websocket/v1.0/component/listener?tenantId=" + (StudioToolkit && StudioToolkit.getCatalogProperties() ? StudioToolkit.getCatalogProperties()['tenant-id'].value : "") + "&event=Alarm_PushAlarmEvent__e",
                        websocket: {},
                        alarmCount: 0, alarmPopCount: 0, alarmMusic: { src: widgetBasePath + 'audio/alarm.wav' },
                        alarmStorage: { safety: false, device: false, energy: false, critical: false, major: false, normal: false, info: false },
                        alarmConList: [], showAlarmSound: false,
                        selSpId: '', spaceBuf: {},
                        drawer: { activeIndex: 0, show: false, direction: 'rtl', currStep: 'verify_psw', targetType: '', sendInterval: '', verifyType: '', imgCode: '', verifyBy: '', drawerType: '', scenario: '' },
                        input_phOrEm: { phone: '', email: '', psw: '', imageVfCode: '', verifyCode: '', verifyCodeMsg: _lang.userSetting.basicInfo.drawer.verifyCodeGet, verifyCodeGet: false },
                        userSetParam: { smsTemplate: '', emailTemplate: '', phoneRule: "", emialRule: "" },
                        isAccountOrigin: false, isDisabled: true,
                        safeAcctInit: { phone: '', email: '', phoneIsCertified: false, emailIsCertified: false },
                        safeAcctVerifyRule: {
                            psw: [
                                { required: true, message: _lang.userSetting.basicInfo.drawer.pswInput, trigger: 'blur' }
                            ],
                            phone: [
                                { required: true, message: _lang.userSetting.basicInfo.drawer.newPhoneInput, trigger: 'blur' }
                            ],
                            email: [
                                { required: true, message: _lang.userSetting.basicInfo.drawer.newEmailInput, trigger: 'blur' }
                            ],
                            verifyCode: [
                                { required: true, message: _lang.userSetting.basicInfo.drawer.verifyCodeInput, trigger: 'blur' }
                            ],
                            imageVfCode: [
                                { required: true, message: _lang.userSetting.basicInfo.drawer.imgCodeInput, trigger: 'blur' }
                            ]
                        },
                        viewName: true,
                        originalName: ""
                    },
                    computed: {
                        drawerTitle: function () {
                            if (this.drawer.drawerType == 'modiPhOrEm') {
                                if (this.drawer.scenario == 'addOrUp') {
                                    if (this.drawer.targetType == 'phone') {
                                        return this.safeAcctInit.phone ? _lang.userSetting.basicInfo.drawer.updatePhone : _lang.userSetting.basicInfo.acctAndSafe.bindPhone;
                                    } else if (this.drawer.targetType == 'email') {
                                        return this.safeAcctInit.email ? _lang.userSetting.basicInfo.drawer.updateEmail : _lang.userSetting.basicInfo.acctAndSafe.bindEmail;
                                    }
                                } else if (this.drawer.scenario == 'certify') {
                                    return this.drawer.targetType == 'phone' ? _lang.userSetting.basicInfo.drawer.certifyPhone : _lang.userSetting.basicInfo.drawer.certifyEmail
                                }
                            }
                            if (this.drawer.drawerType == 'modiPsw') {
                                return _lang.userSetting.basicInfo.drawer.pswModify;
                            }
                        },
                        phoneBindMsg: function () {
                            return this.safeAcctInit.phone ? _lang.userSetting.basicInfo.drawer.boundInfo : _lang.userSetting.basicInfo.drawer.phoneNoBoundInfo;
                        },
                        emailBindMsg: function () {
                            return this.safeAcctInit.email ? _lang.userSetting.basicInfo.drawer.boundInfo : _lang.userSetting.basicInfo.drawer.emailNoBoundInfo;
                        },
                        phoneMask: function () {
                            return this.safeAcctInit.phone.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2")
                        },
                        emailMask: function () {
                            let em = this.safeAcctInit.email;
                            return em ? em.substr(0, 2) + '***' + em.substr(em.indexOf("@")) : ''
                        }
                    },
                    created() {
                        this.changeElementUILocale(HttpUtils.getLocale());
                        this.start();
                        window.addEventListener('message', (e) => { this.syncParentElem(e.data); }, false);
                        if (window.localStorage.getItem('MainFrame_AlarmLevel')) {
                            this.alarmStorage = JSON.parse(window.localStorage.getItem('MainFrame_AlarmLevel'));
                        }
                    },
                    watch: {
                        alarmStorage: {
                            handler(newV, oldV) {
                                window.localStorage.setItem('MainFrame_AlarmLevel', JSON.stringify(this.alarmStorage))
                            }, deep: true
                        }
                    },
                    mounted() {
                        window.onresize = () => {
                            return (() => { this.menuScrollInit(); })()
                        };
                        window.addEventListener("popstate", (e) => {
                            if (!e.state) {
                                window.history.replaceState(this.framesUrl, window.location.href);
                            } else {
                                window.history.back();
                            }
                        });

                        let iframe = document.querySelector('#ScFrame');
                        if (iframe.attachEvent) {
                            iframe.attachEvent('onload', ()=> {
                                setTimeout(() => { this.contentWrap = 'float-content-wrap'; }, 100);
                            });
                        } else {
                            iframe.onload = ()=> {
                                setTimeout(() => { this.contentWrap = 'float-content-wrap'; }, 100);
                            }
                        }
                    },
                    destroyed() {
                        this.dialog.setCloseTimer && clearTimeout(this.dialog.setCloseTimer);
                    },

                    methods: {
                        async start() {
                            if (this.studioInReader) {
                                this.bUrlHash = decodeURI(location.hash) ? decodeURI(location.hash).substring(1, decodeURI(location.hash).length) : '';
                                window.sessionStorage.removeItem('currentOrganizationData');
                                await this.getSysParameter();
                                this.identityId = await this.verifyLogin();
                                if (this.identityId) {
                                    $("#unified-portal").removeClass("preload");

                                    let currentUrl = window.location.href;
                                    let urlInfo = await this.resolveUrl(currentUrl);
                                    if (urlInfo && urlInfo.redirectUrl && urlInfo.oauthCode) {
                                        let redirectUrl = decodeURIComponent(urlInfo.redirectUrl) + (urlInfo.redirectUrl.indexOf("?") >= 0 ? "&code=" : "?code=") + urlInfo.oauthCode;
                                        window.location.href = redirectUrl;
                                        return;
                                    }
                                    this.noRedirect = true;

                                    this.callOpInfo();
                                } else {
                                    this.redictLogin();
                                }
                            } else {
                                this.identityId = "mock"; // develop mock data
                            }
                        },

						/***
						 * verify Operator is Login or not
						 */
                        async verifyLogin() {
                            let identityId = "";
                            let callVerify = async () => {
                                return new Promise(resolve => {
                                    this.callConn("/SmartCampus__UnifiedPortal/1.0.0/verifyLogin", {}, "POST", (res) => {
                                        if (res.resp.code == '0' && res.data[0].identityId) {
                                            identityId = res.data[0].identityId || '';
                                        }
                                        resolve(identityId);
                                    });
                                });
                            };
                            identityId = await callVerify();
                            return identityId;
                        },

                        async resolveUrl(url) {
                            if (url.indexOf("redirect_uri=") > -1 && url.indexOf("client_id=") > -1) {
                                let remaidUrl = url.split("redirect_uri=")[1];
                                let getCodeUrl = decodeURIComponent(remaidUrl.split('&')[0]);
                                let redirectUrl = decodeURIComponent(remaidUrl);
                                remaidUrl = url.split("client_id=")[1];
                                let clientId = remaidUrl.split('&')[0];
                                let checkResult = await this.verifyApplicationUrl(clientId, getCodeUrl);
                                if (checkResult.pass) {
                                    let oauthCode = await this.getOauthCode(clientId, getCodeUrl);
                                    return {
                                        redirectUrl: redirectUrl,
                                        oauthCode: oauthCode.code
                                    };
                                }
                            }
                        },

                        async getOauthCode(clientId, redirectUrl) {
                            return new Promise((resolve) => {
                                this.callConn("/SmartCampus__UnifiedPortal/1.0.0/oauth2/getAuthCode", {
                                    "clientId": clientId,
                                    "redirectUri": redirectUrl
                                }, "POST", (re) => {
                                    if (re.resp.code == '0') {
                                        resolve(re.data);
                                    }
                                });
                            });
                        },

                        async verifyApplicationUrl(clientId, redirectUrl) {
                            return new Promise((resolve) => {
                                this.callConn("/SmartCampus__UnifiedPortal/1.0.0/oauth2/verifyApplicationUrl", {
                                    "clientId": clientId,
                                    "redirectUri": redirectUrl
                                }, "POST", (re) => {
                                    if (re.resp.code == '0') {
                                        resolve(re.data);
                                    }
                                });
                            });
                        },

                        /**
                         * Get Operator Detail Info
                         */
                        async callOpInfo() {
                            let opRequest = {
                                'identityId': this.identityId
                            };
                            let opRes = await this.getOperator(opRequest);
                            if (opRes) {
                                if (opRes.status != "Active") {
                                    this.dialog.dialogVisible = true;
                                    this.dialog.setCloseTimer = setTimeout(() => {
                                        this.redictLogin();
                                    }, 5000);
                                    return false;
                                }
                                this.userName = (opRes.loginAccounts[0] || []).loginAccount || '';
                                this.userPic = opRes.logo || this.initUserPic;
                                this.judgeUserProfile(opRes);
                                this.operatorId = opRes.id || '';
                                this.operatorId && this.getMenuList(this.operatorId);

                                //get space info by operator org info
                                let orgInfo = [];
                                orgInfo = (opRes.organizations || []).map((value) => {
                                    return value.organization;
                                });
                                window.sessionStorage.setItem('currentOrganizationData', JSON.stringify(orgInfo));

                                if (!this.sysParams.spaceAllow) {
                                    return;
                                }
                                if (!this.sysParams.spaceRootCode) {
                                    this.showTips(this.lang.message.noSpaceRoot, "warning", 0);
                                    return;
                                }

                                if (!opRes.organizations || opRes.organizations.length == 0) {
                                    this.getSysSpaceInfo(); //org no match space data, get data from sysparameter
                                    return;
                                }
                                this.orgSpaceIdList = await this.getSpaceByOrg(orgInfo);
                                if (this.orgSpaceIdList.length == 0) {
                                    this.getSysSpaceInfo(); //org no match space data, get data from sysparameter
                                    return;
                                }
                                let spReq = {
                                    "start": 0, "limit": 500,
                                    "condition": {
                                        "spaceRootCode": {
                                            "value": this.sysParams.spaceRootCode, "operator": "="
                                        },
                                        "id": {
                                            "valueList": this.orgSpaceIdList, "operator": "in"
                                        }
                                    }
                                }
                                let spDetailRes = await this.getSpaceDetail(spReq);
                                if (spDetailRes.length > 0) { // spDetailRes 空间实例详情列表； this.orgSpaceIdList 空间id列表
                                    for (let j = 0; j < spDetailRes.length > 0; j++) {
                                        for (let i = 0; i < this.orgSpaceIdList.length > 0; i++) { // 默认取该操作员组织关联的第一个空间实例作为默认选中空间
                                            if (spDetailRes[j].id == this.orgSpaceIdList[i] && this.spLevList.some(lev => lev == spDetailRes[j].level.code)) {
                                                this.getCurrSpTree(spDetailRes[j].id, 'init');
                                                this.opOrgSpRely = true;
                                                break;
                                            }
                                        }
                                        if (this.opOrgSpRely) break;
                                    }
                                }
                                !this.opOrgSpRely && this.getSysSpaceInfo();  // org no match space data, get data from sysparameter
                            }
                        },

						/**
						 * get operator information
						 * @param {*} opReq 
						 */
                        getOperator(opReq) {
                            this.isAccountOrigin = false;
                            return new Promise((resolve) => {
                                this.callConn("/SmartCampus__SystemManagement/1.0.0/queryCurrentOperator", opReq, "POST", (res) => {
                                    let opResp = '';
                                    if (res.resp.code == '0') {
                                        let opCount = res.data[0].count || 0;
                                        let operator = res.data[0].operators || [];
                                        if (operator[0].accountOrigin && operator[0].accountOrigin !== "System") {
                                            this.isAccountOrigin = false;
                                        } else {
                                            this.isAccountOrigin = true;
                                        }
                                        opResp = opCount > 0 ? operator[0] : '';
                                    }
                                    resolve(opResp);
                                });
                            });
                        },

                        /**************************************************空间切换**************************************************/

						/**
						 * get related space from org list of operator
						 * @param {*} org 
						 */
                        getSpaceByOrg(org) {
                            let orgInpu = {
                                "condition": {
                                    "id": {
                                        "valueList": org,
                                        "operator": "in"
                                    }
                                },
                                "start": 0, "limit": 500
                            };
                            return new Promise((resolve) => {
                                this.callConn("/Organization/0.1.0/Organization/query", orgInpu, "POST", (res) => {
                                    let orgSpace = [];
                                    if (res.resp.code == '0') {
                                        let orgCount = res.data[0].count || 0;
                                        let organizations = res.data[0].organizations || [];
                                        if (orgCount > 0) {
                                            organizations.forEach((val) => {
                                                if (val.relatedSpace) {
                                                    orgSpace = orgSpace.concat(val.relatedSpace);
                                                }
                                            });
                                        }
                                    }
                                    resolve(orgSpace);
                                });
                            });
                        },
                        addArea(item) {
                            if (item.id) {
                                this.getCurrSpTree(item.id, "toggle");
                            }
                        },
                        showLevelList(item, index) {
                            //判断为首级直接取第一级数据
                            if (index !== 0) {
                                if (this.selArea[index - 1]) {
                                    //取得上级的子级数据
                                    this.getCurrSpTree(this.selArea[index - 1]["id"], "toggle");
                                }
                            }
                        },

						/**
						 * 选中空间信息进行切换并局部刷新
						 * @param {*} type 
						 */
                        async handleLoc(type) {
                            let reloadUrl = '';
                            if (type == 'reset') {
                                //返回当前选中的项
                                await this.getCurrSpTree(this.selSpId, "toggle");
                                this.handleLoc("confirm");
                            } else {
                                this.selAreaTitle = this.selArea.map(item => { return item.spaceName }).join(' · ');
                                if (this.selSpNode.code) {
                                    let curSpaceData = {
                                        spaceCode: this.selSpNode.code,
                                        spaceInfo: [this.selSpNode],
                                    };
                                    window.sessionStorage.setItem('currentSpaceData', JSON.stringify(curSpaceData));
                                    this.selSpId = this.selSpNode.id;
                                    let spPara = {
                                        start: 0,
                                        limit: 1,
                                        condition: {
                                            spaceId: {
                                                value: this.selSpId
                                            }
                                        },
                                        async: false
                                    };
                                    this.callConn("/SmartCampus__UnifiedPortal/1.0.0/querySpaceSwitchRelation", spPara, "POST", (res) => {
                                        if (res.resp.code == '0' && res.data && (res.data.spaceSwitchRelation || []).length) {
                                            reloadUrl = res.data.spaceSwitchRelation[0].url || '';
                                        }
                                    });
                                }
                            }
                            if (!reloadUrl) {
                                //获取iframe当前的url
                                document.getElementById("ScFrame").contentWindow.location.reload();
                                //切换园区，告警清空
                                if (this.sysParams.alarmConf) {
                                    this.alarmCount = 0;
                                    for (let i = 0; i < this.alarmConList.length; i++) {
                                        this.alarmConList[i]['count'] = 0;
                                    }
                                }
                            } else {
                                window.location.href = reloadUrl;
                                window.reload();
                            }
                            this.spaceBuf = {};
                        },
						/**
						 *  assemble space info
						 */
                        getSysSpaceInfo() {
                            if (!this.sysParams.defaultSelCode) {
                                this.showTips(this.lang.message.noDefaultSpace, "warning", 0);
                                return;
                            }
                            let insReq = {
                                "start": 0, "limit": 1,
                                "condition": {
                                    "code": { "value": this.sysParams.defaultSelCode, "operator": "=" },
                                    "spaceRootCode": { "value": this.sysParams.spaceRootCode, "operator": "=" }
                                }
                            };
                            this.getSpaceDetail(insReq).then((spDetailRes) => {
                                if (spDetailRes.length > 0 && spDetailRes[0].id) {
                                    this.orgSpaceIdList = [spDetailRes[0].id];
                                    this.getCurrSpTree(spDetailRes[0].id, 'init');
                                }
                            });
                        },

						/**
						 * get space detail
						 * @param {*} spPara 
						 */
                        getSpaceDetail(spPara) {
                            return new Promise((resolve) => {
                                this.callConn("/Space/0.1.0/Space/query", spPara, "POST", (res) => {
                                    let insInfo = [];
                                    if (res.resp.code == '0') {
                                        insInfo = (res.data[0] || {}).spaces || [];
                                    }
                                    resolve(insInfo);
                                });
                            });
                        },

						/**
						 * init or click --get current node space info
						 * @param {*} id 
						 * @param {*} type 
						 */
                        async getCurrSpTree(id, type) {

                            if(type == 'init'){
                                let curSpaceData = JSON.parse(sessionStorage.getItem('currentSpaceData'));
                                if(curSpaceData && curSpaceData.spaceInfo && curSpaceData.spaceInfo.length > 0 && curSpaceData.spaceInfo[0]['id']){
                                    id = curSpaceData.spaceInfo[0]['id'];
                                }
                            }

                            let spTreeRes = await this.getSpTree(id);
                            if (JSON.stringify(spTreeRes) != '{}') {
                                this.selSpNode = spTreeRes;
                                let path = this.selSpNode.path.slice();
                                path.unshift(JSON.parse(JSON.stringify(this.selSpNode)));
                                this.selArea = path.slice().reverse();
                                this.switchAreaItem = (this.selSpNode.level && this.spLevList.some(lev => lev == this.selSpNode.level.code) && this.orgSpaceIdList.some(spId => {
                                    let mark = false;
                                    for (let i = 0; i < path.length; i++) {
                                        if (spId == path[i]["id"]) {
                                            mark = true;
                                            break;
                                        }
                                    }
                                    return mark;
                                })
                                ) ? true : false;
                                this.unSelArea = this.isSwitchSpace(this.selSpNode.children);
                                if (type == 'init') { //情形1：初始化加载
                                    this.showArea = true;
                                    this.selAreaTitle = this.selArea.map(item => { return item.spaceName }).join(' · ');

                                    let curSpaceData = {//已选节点放入缓存供其他组件初始化获取
                                        spaceCode: this.selSpNode.code,
                                        spaceInfo: [this.selSpNode],
                                    };
                                    window.sessionStorage.setItem('currentSpaceData', JSON.stringify(curSpaceData));
                                    this.selSpId = this.selSpNode.id;
                                }
                            }
                        },

                        /**
                         * 提前判断所有子节点是否可被切换给出提示
                         * @param {*} id 
                         */
                        isSwitchSpace(data) {
                            let orgSpaceIdObj = {};
                            this.orgSpaceIdList.forEach((item, index) => {
                                orgSpaceIdObj[item] = index + 1;
                            });

                            let spLevObj = {};
                            this.spLevList.forEach((it, idx) => {
                                spLevObj[it] = idx + 1;
                            });

                            (data || []).forEach(item => {
                                item.canSwitch = false;
                                if (item.level && item.level.code && spLevObj[item.level.code]) {
                                    item.path.unshift($.extend(true, {}, item));
                                    for (let i = 0; i < item.path.length; i++) {
                                        if (orgSpaceIdObj[item.path[i]["id"]]) {
                                            item.canSwitch = true;
                                            break;
                                        }
                                    }
                                }
                            });
                            return data;
                        },

						/**
						 * get space tree
						 * @param {*} id 
						 */
                        getSpTree(id) {
                            return new Promise((resolve) => {
                                this.callConn("/Space/0.1.0/querySpaceTree/" + id, { "isChildren": true }, "POST", (re) => {
                                    let selSpNode = {};
                                    if (re.resp.code == '0') {
                                        selSpNode = (re.data[0] || {}).space || {};
                                    }
                                    resolve(selSpNode);
                                });
                            });
                        },

                        /**********************************************导航菜单*************************************************/

						/**
						 * get left navigations
						 * @param {*} operatorId 
						 */
                        getMenuList(operatorId) {
                            this.callConn("/SmartCampus__UnifiedPortal/1.0.0/queryMenu/" + operatorId, {}, "GET", (res) => {
                                if (res.resp.code == '0') {
                                    let menuList = res.data[0].MenuList || [];

                                    if (menuList.length > 0) {
                                        menuList.forEach((item) => {
                                            item.imageList = item.image ? item.image.split(';') : [];
                                        });
                                        this.menuList = menuList;

                                        let hasUrlHash = this.bUrlHash ? true : false;
                                        // refresh locate
                                        if (hasUrlHash) {
                                            hasUrlHash = false;
                                            let hashObj = { 'id': this.bUrlHash };
                                            let hashPath = this.getPathByKey(hashObj, this.menuList, 'id', 'subMenu', 'eq') || [];
                                            if (hashPath.length > 0 && hashPath[hashPath.length - 1].link) {
                                                hasUrlHash = true;
                                                let len = hashPath.length;
                                                (0 == len - 4) && this.toggleFrame(hashPath[len - 1], hashPath[len - 4].idx, hashPath[len - 3].idx, hashPath[len - 2].idx, hashPath[len - 1].idx);
                                                (0 == len - 3) && this.toggleFrame(hashPath[len - 1], hashPath[len - 3].idx, hashPath[len - 2].idx, hashPath[len - 1].idx);
                                                (0 == len - 2) && this.toggleFrame(hashPath[len - 1], hashPath[len - 2].idx, hashPath[len - 1].idx);
                                                (0 == len - 1) && this.toggleFrame(hashPath[len - 1], hashPath[len - 1].idx);
                                            }
                                        }
                                        if (!hasUrlHash) { //default
                                            let meList = this.menuList;
                                            if(meList.length > 0){
                                                if (meList[0].subMenu.length > 0 && meList[0].subMenu[0].subMenu.length > 0 && meList[0].subMenu[0].subMenu[0].subMenu.length > 0 && meList[0].subMenu[0].subMenu[0].subMenu[0].link){
                                                    this.toggleFrame(meList[0].subMenu[0].subMenu[0].subMenu[0], 0, 0, 0, 0);
                                                }else if (meList[0].subMenu.length > 0 && meList[0].subMenu[0].subMenu.length > 0 && meList[0].subMenu[0].subMenu[0].link) {
                                                    this.toggleFrame(meList[0].subMenu[0].subMenu[0], 0, 0, 0);
                                                } else if (meList[0].subMenu.length > 0 && meList[0].subMenu[0].link) {
                                                    this.toggleFrame(meList[0].subMenu[0], 0, 0);
                                                } else if (meList[0].link) {
                                                    this.toggleFrame(meList[0], 0);
                                                }
                                            }
                                        }
                                        this.$nextTick(function () {
                                            this.menuScrollInit();
                                        });
                                        //有菜单才能展示告警，因为要跳转
                                        this.sysParams.alarmConf && this.initWebSocket();
                                    }
                                }
                            });
                        },

						/**
						 * 由首次可被选择节点反推其到根节点的路径  
						 * @param {*} value 
						 * @param {*} arr 
						 * @param {*} tag 
						 * @param {*} subName 
						 */
                        getPathByKey(value, arr, tag, subName, type) {
                            let temppath = [];
                            try {
                                function getNodePath(node, idx) {
                                    node.idx = idx;
                                    temppath.push(node);
                                    //找到符合条件的节点，通过throw终止掉递归
                                    if (type == 'eq') {
                                        if (node[tag] === value[tag]) {
                                            throw ("GOT IT!");
                                        }
                                    } else if (type == 'in') {
                                        if (node[tag].includes(value[tag])) {
                                            throw ("GOT IT!");
                                        }
                                    }
                                    if (node[subName] && node[subName].length > 0) {
                                        for (var i = 0; i < node[subName].length; i++) {
                                            getNodePath(node[subName][i], i);
                                        }
                                        //当前节点的子节点遍历完依旧没找到，则删除路径中的该节点
                                        temppath.pop();
                                    } else {
                                        //找到叶子节点时，删除路径当中的该叶子节点
                                        temppath.pop();
                                    }
                                }
                                for (let i = 0; i < arr.length; i++) {
                                    getNodePath(arr[i], i);
                                }
                            } catch (e) {
                                return temppath;
                            }
                        },

                        hoverMenu(idx, flag, e) {
                            this.hoverIdx = flag ? idx : null;

                            let menuDOM = e.target;
                            let subMenuDOM = menuDOM.children[2];
                            let subMenuTop = menuDOM.offsetTop + parseFloat($(".left-wrap").css("top"));
                            let subMenuLiHeight = parseFloat($(".menu__sub li").css('height'));
                            let subMenuLiCount = subMenuDOM.children.length;
                            let subMenuHeight = subMenuLiHeight * subMenuLiCount;
                            let subMenuHeightTop = subMenuTop + parseFloat($(".menu__main").css("height"));
                            let subMenuHeightBottom = window.innerHeight - parseFloat($(".up-top").css("height")) - subMenuTop;
                          
                            if (flag) {
                                if (subMenuHeightBottom >= subMenuHeightTop) {
                                    subMenuDOM.style.top = 0;
                                    subMenuDOM.style.bottom = "auto";
                                } else {
                                    subMenuDOM.style.top = "auto";
                                    subMenuDOM.style.bottom = 0;
                                }
                            } else {
                                if (subMenuTop + subMenuHeight + parseFloat($(".up-top").css("height")) > window.innerHeight) {
                                    subMenuDOM.style.top = 0;
                                    subMenuDOM.style.bottom = "auto";
                                }
                            }

                            document.getElementsByClassName('menu__sub')[idx].style.display = "block";
                            let menuSubWidth = document.getElementsByClassName('menu__sub')[idx].offsetWidth || 0;
                            $("#unified-portal .menu__sub-sub").css('left', menuSubWidth + 'px');

                        },

                        hoverSubMenu(idx, flag) {
                            this.hoverSubIdx = flag ? idx : null;

                            if(flag && this.hoverIdx != null){
                                document.getElementsByClassName('menu__sub')[this.hoverIdx].getElementsByClassName('sub-dropdown')[idx].getElementsByClassName('menu__sub-sub')[0].style.display = 'block';
                                let menuSubsWidth = document.getElementsByClassName('menu__sub')[this.hoverIdx].getElementsByClassName('sub-dropdown')[idx].getElementsByClassName('menu__sub-sub')[0].offsetWidth || 0; 
                                $("#unified-portal .menu__sub-sub-sub").css('left', menuSubsWidth + 'px');
                            }
                            
                        },
                        hoverSub2Menu(idx, flag) {
                            this.hoverSub2Idx = flag ? idx : null;
                        },
                        loadIframe() {
                            this.showIframe = true;
                            if (this.isIframeThird) {
                                this.isIframeThird = false;
                            } else {
                                this.contentWrap = 'content-wrap';
                            }
                        },

                        async toggleFrame(item, idx, sub_idx, sub2_idx, sub3_idx) {
                            if (item.link) {
                                this.showIframe = false;
                                this.isOpenNewTab = false;
                                if (item.openType == 'NEWTAB') this.isOpenNewTab = true;
                                //判断Iframe URL 除hash外是否有变化,若无变化则手动触发loadIframe，否则不会主动触发iframe load
                                let filterLink = item.link;
                                filterLink = filterLink.indexOf("?") >= 0 ? filterLink.substring(0, filterLink.indexOf("?")) : filterLink;
                                filterLink = filterLink.indexOf("#") >= 0 ? filterLink.substring(0, filterLink.indexOf("#")) : filterLink;
                                filterLink = filterLink.indexOf("&") >= 0 ? filterLink.substring(0, filterLink.indexOf("&")) : filterLink;

                                let curFrameSrc = "";
                                let curFrameWinLoc = '';
                                try {
                                    curFrameWinLoc = document.getElementById("ScFrame").contentWindow.document.location;
                                } catch (e) {
                                    console.log(e);
                                }

                                if (curFrameWinLoc) {
                                    curFrameSrc = curFrameWinLoc.href && curFrameWinLoc.href.split(curFrameWinLoc.origin)[1];
                                }
                                let filterLastUrc = curFrameSrc || this.iframeSrc;
                                filterLastUrc = filterLastUrc.indexOf("?") >= 0 ? filterLastUrc.substring(0, filterLastUrc.indexOf("?")) : filterLastUrc;
                                filterLastUrc = filterLastUrc.indexOf("#") >= 0 ? filterLastUrc.substring(0, filterLastUrc.indexOf("#")) : filterLastUrc;
                                filterLastUrc = filterLastUrc.indexOf("&") >= 0 ? filterLastUrc.substring(0, filterLastUrc.indexOf("&")) : filterLastUrc;
                                if (item.openType == 'NEWTAB') {
                                    window.open(item.link);
                                } else {
                                    let urlInfo = await this.resolveUrl(item.link);
                                    if (urlInfo && urlInfo.redirectUrl && urlInfo.oauthCode) {
                                        let redirectUrl = decodeURIComponent(urlInfo.redirectUrl) + (urlInfo.redirectUrl.indexOf("?") >= 0 ? "&code=" : "?code=") + urlInfo.oauthCode;
                                        this.iframeSrc = redirectUrl;
                                        this.loadIframe();
                                        this.isIframeThird = true;
                                    } else {
                                        //清除浏览器缓存
                                        if (item.link.indexOf("?") >= 0) {
                                            this.iframeSrc = filterXSS(item.link) + "&t=" + new Date().getTime();
                                        } else {
                                            this.iframeSrc = filterXSS(item.link) + "?t=" + new Date().getTime();
                                        }
                                        if (filterLink == filterLastUrc) {
                                            this.loadIframe();
                                        }
                                    }
                                }
                                this.exConfAfterToggle(null, item, idx, sub_idx, sub2_idx, sub3_idx);
                            }
                        },

                        exConfAfterToggle(arr, item, idx, sub_idx, sub2_idx, sub3_idx) {
                            if (!arr) {
                                arr = this.menuList
                            }
                            //change menu item
                            this.clicIdx = (idx || idx == 0) ? idx : this.clicIdx;
                            this.clicSubIdx = (sub_idx || sub_idx == 0) ? sub_idx : this.clicSubIdx;
                            this.clicSub2Idx = (sub2_idx || sub2_idx == 0) ? sub2_idx : this.clicSub2Idx;
                            this.clicSub3Idx = (sub3_idx || sub3_idx == 0) ? sub3_idx : this.clicSub3Idx;

                            //push localStorage to show menucrubs
                            let currMenuData = [];
                            let allMenu = arr;
                            if (sub3_idx >= 0) {
                                currMenuData.push(allMenu[idx]);
                                currMenuData.push(allMenu[idx].subMenu[sub_idx]);
                                currMenuData.push(allMenu[idx].subMenu[sub_idx].subMenu[sub2_idx]);
                                currMenuData.push(allMenu[idx].subMenu[sub_idx].subMenu[sub2_idx].subMenu[sub3_idx]);
                            } else if (sub2_idx >= 0) {
                                currMenuData.push(allMenu[idx]);
                                currMenuData.push(allMenu[idx].subMenu[sub_idx]);
                                currMenuData.push(allMenu[idx].subMenu[sub_idx].subMenu[sub2_idx]);
                            } else if (sub_idx >= 0) {
                                currMenuData.push(allMenu[idx]);
                                currMenuData.push(allMenu[idx].subMenu[sub_idx]);
                            } else if (idx >= 0) {
                                currMenuData.push(allMenu[idx]);
                            }
                            currMenuData.forEach((it) => {
                                it.name = it.label;
                                it.url = it.link;
                            });
                            window.localStorage.setItem('currentMenuData', JSON.stringify(currMenuData));

                            //set anchor point for browser url
                            let nowHref = window.location.href;
                            let end = nowHref.indexOf('#');
                            let rurl = nowHref.substring(0, end);
                            window.location.href = rurl + '#' + item.id;
                        },

                        syncParentElem(data) {
                            /*  1:拿到data与当前正在加载的iframe src地址对比，若相同则停止继续执行；
                                2:过滤其所在菜单列表的菜单项，若不在菜单项则停止继续执行；(页面链接需唯一，否则默认取第一个)
                                3:改变面包屑、菜单选中项、url hash
                            */
                            window.history.pushState(data.currentLocObj.href, null, window.location.href);
                            this.framesUrl = data.currentLocObj.href;
                            let dataUrl = data.currentLocObj.href.includes("?t=") ? data.currentLocObj.href.split("?t=")[0] : data.currentLocObj.href;
                            dataUrl = dataUrl.split(data.currentLocObj.origin)[1];

                            if (dataUrl.includes("?")) {
                                dataUrl = dataUrl.split("?")[0];
                            }
                            let hashPath = this.getPathByKey({ link: dataUrl }, this.menuList, 'link', 'subMenu', 'in') || [];

                            if (!(hashPath && hashPath.length > 0)) { return; }
                            let len = hashPath.length;
                            (0 == len - 4) && this.exConfAfterToggle(this.menuList, hashPath[len - 1], hashPath[len - 4].idx, hashPath[len - 3].idx, hashPath[len - 2].idx, hashPath[len - 1].idx);
                            (0 == len - 3) && this.exConfAfterToggle(this.menuList, hashPath[len - 1], hashPath[len - 3].idx, hashPath[len - 2].idx, hashPath[len - 1].idx);
                            (0 == len - 2) && this.exConfAfterToggle(this.menuList, hashPath[len - 1], hashPath[len - 2].idx, hashPath[len - 1].idx);
                            (0 == len - 1) && this.exConfAfterToggle(this.menuList, hashPath[len - 1], hashPath[len - 1].idx);
                        },

                        goToFramePage(code, data) {
                            let hashPath = this.getPathByKey({ 'code': code }, this.menuList, 'code', 'subMenu', 'eq') || [];
                            let targetMenuId = '';
                            if (hashPath.length > 0) {
                                targetMenuId = hashPath[hashPath.length - 1]['id'];
                            }
                            if (targetMenuId) {
                                if (('#' + targetMenuId) != decodeURI(location.hash)) { //非当前页，则前往
                                    if (hashPath[hashPath.length - 1].link) {
                                        let len = hashPath.length;
                                        (0 == len - 4) && this.toggleFrame(hashPath[len - 1], hashPath[len - 4].idx, hashPath[len - 3].idx, hashPath[len - 2].idx, hashPath[len - 1].idx);
                                        (0 == len - 3) && this.toggleFrame(hashPath[len - 1], hashPath[len - 3].idx, hashPath[len - 2].idx, hashPath[len - 1].idx);
                                        (0 == len - 2) && this.toggleFrame(hashPath[len - 1], hashPath[len - 2].idx, hashPath[len - 1].idx);
                                        (0 == len - 1) && this.toggleFrame(hashPath[len - 1], hashPath[len - 1].idx);
                                    }
                                } else if (data && data.id) { //当前页，且data.id，打开告警详情
                                    document.getElementById("ScFrame").contentWindow.showEventDetail({ id: data.id, incidentNumber: data.incidentNumber, code: data.incidentNumber });
                                }
                            }
                        },

                        /*****************************************************告警管理********************************************************/
                        initWebSocket() {
                            if (!this.sysParams.alarmContent) return false;
                            let alarmConList = JSON.parse(this.sysParams.alarmContent);
                            alarmConList.forEach(item => {
                                let codeMenuList = this.getPathByKey({ 'code': item.code }, this.menuList, 'code', 'subMenu', 'eq') || [];
                                if (codeMenuList.length > 0) {
                                    item.count = 0;
                                    item.categoryArr = item.category.split(";")
                                    switch (item.type) {
                                        case "safety":
                                            this.alarmConList.push({
                                                name: this.lang.alarmIns.safety,
                                                icon: widgetBasePath + "image/safety.png",
                                                ...item
                                            })
                                            break;
                                        case "device":
                                            this.alarmConList.push({
                                                name: this.lang.alarmIns.device,
                                                icon: widgetBasePath + "image/device.png",
                                                ...item
                                            })
                                            break;
                                        case "energy":
                                            this.alarmConList.push({
                                                name: this.lang.alarmIns.energy,
                                                icon: widgetBasePath + "image/energy.png",
                                                ...item
                                            })
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            });

                            this.websocket = new WebsocketHeartbeatJs({
                                url: this.websocketUrl, pingTimeout: 15000, pongTimeout: 10000, reconnectTimeout: 2000, pingMsg: "heartbeat"
                            });
                            this.websocket.onmessage = event => {
                                this.handleMsg(event);
                            }
                        },

                        handleMsg(event) {
                            if (event.data === 'heartbeat') return;
                            let data = {};
                            try {
                                data = JSON.parse(event.data); data = JSON.parse(data.content); data = JSON.parse(data.payload);
                                if (data && data.operation == "add") {

                                    let cueCateArr = this.alarmConList.filter(item => {
                                        return item["categoryArr"].indexOf(data.categoryName) > -1
                                    });
                                    if (!cueCateArr.length) return;
                                    if (!this.alarmStorage[cueCateArr[0]['type']]) return;
                                    //查看告警是否在当前空间下或子空间下 
                                    let spaceMatch = false;
                                    let curSpaceData = JSON.parse(sessionStorage.getItem('currentSpaceData'));
                                    let locData = '';
                                    if (curSpaceData && curSpaceData.spaceInfo[0] && curSpaceData.spaceInfo[0].id && data.location) {
                                        if (this.spaceBuf[data.location]) {
                                            locData = this.spaceBuf[data.location];
                                            this.prepareAlarm(data, locData, cueCateArr[0]);
                                        } else {
                                            this.getSpaceDetail({
                                                "start": 0, "limit": 1, "condition": {
                                                    "id": { "value": data.location, "operator": "=" }
                                                }
                                            }).then((spDetailRes) => {
                                                if (spDetailRes.length > 0) {
                                                    if (curSpaceData.spaceInfo[0].id == spDetailRes[0]["id"] || (spDetailRes[0]["path"] || []).some(pathItem => pathItem.id == curSpaceData.spaceInfo[0].id)) {
                                                        spaceMatch = true;
                                                    }
                                                }
                                                if (spaceMatch) {
                                                    let alarmLocList = (spDetailRes[0]["path"] || []).map(pathItem => pathItem.spaceName);
                                                    locData = alarmLocList.reverse().join('/') + '/' + spDetailRes[0]["spaceName"] || '';
                                                    this.spaceBuf[data.location] = locData;
                                                    this.prepareAlarm(data, locData, cueCateArr[0]);
                                                }
                                            });
                                        }
                                    }
                                }
                            } catch (e) { }
                        },

                        prepareAlarm(data, locData, cueCateObj) {
                            this.alarmCount++;
                            for (let i = 0; i < this.alarmConList.length; i++) {
                                if (cueCateObj.type == this.alarmConList[i]['type']) {
                                    this.alarmConList[i]['count']++;
                                    break;
                                }
                            }
                            let category = this.localeLang == 'en-US' ? data.categoryInternationNameEn : data.categoryInternationNameCn;
                            let detail = this.localeLang == 'en-US' ? data.alarmDefinitionNameEn : data.alarmDefinitionNameCn;
                            let alarmData = {
                                category: category || '',
                                detail: detail || '',
                                number: data.alarmNumber || '',
                                loc: locData,
                                level: data.alarmLevel.toLowerCase(),
                                alarmId: data.alarmId || '',
                                menuCode: cueCateObj.code
                            };
                            this.alarmPopUp(alarmData);
                        },

                        alarmPopUp(alarmData) {
                            let _this = this;
                            _this.alarmPopCount++;
                            if (_this.alarmStorage[alarmData.level]) {
                                _this.$nextTick(() => {
                                    document.getElementById('buttonAudio').play();
                                });
                            }
                            let btnContent = _this.lang.alarmNotifyBtn;
                            const h = this.$createElement;
                            _this.$notify({
                                title: `${alarmData.category} - ${alarmData.detail}`,
                                message: h('div', { class: 'notify-msg' }, [
                                    h('p', { class: 'single-overflow__ellipsis', title: `${alarmData.number}` }, `${alarmData.number}`),
                                    h('p', { class: 'single-overflow__ellipsis', title: `${alarmData.loc}` }, `${alarmData.loc}`),
                                    h('p', { style: 'width: 100%; margin-top:8px;' }, [
                                        h(
                                            'button',
                                            {
                                                class: 'std-support',
                                                on: {
                                                    click: () => {
                                                        _this.goToFramePage(alarmData.menuCode, { 'id': `${alarmData.alarmId}`, 'incidentNumber': `${alarmData.number}` })
                                                    }
                                                }
                                            }, btnContent
                                        )
                                    ])
                                ]),
                                duration: _this.sysParams.alarmDuration,
                                dangerouslyUseHTMLString: true,
                                customClass: 'hw-notify',
                                iconClass: 'el-icon-warning-outline',
                                offset: 37,
                                onClose: () => {
                                    _this.alarmPopCount--;
                                    _this.$nextTick(() => {
                                        _this.alarmPopCount == 0 && document.getElementById('buttonAudio').pause();
                                    });
                                }
                            });
                        },

                        /*****************************************************用户设置*****************************************************/

					    /**
						 * user set
						 * @param {*} command 
						 */
                        userSet(command) {
                            switch (command) {
                                case 'user':
                                    //字段初始化
                                    this.acct = { userPic: '', name: '', nickname: '', oriPsw: '', psw: '', rePsw: '' };
                                    this.dataErr = { name: false, nickname: false, oriPsw: false, psw: false, rePsw: false };
                                    this.dataErrDesc = { name: "", nickname: "", oriPsw: "", psw: "", rePsw: "" }
                                    this.userTabSel = 'basic';
                                    this.userPicFile = [];

                                    this.getUserSetSysParameter();
                                    let opRequest = { // 管理员有可能修改，因要获取最新operator信息
                                        'identityId': this.identityId
                                    };
                                    this.getOperator(opRequest).then((opRes) => {
                                        if (opRes) {
                                            this.originalName = opRes.name || '';
                                            this.acct.name = opRes.name || '';
                                            this.acct.nickname = opRes.nickName || '';
                                            this.acct.userPic = opRes.logo || this.initUserPic;

                                            this.safeAcctInit.phone = opRes.phoneNumber || '';
                                            this.safeAcctInit.email = opRes.email || '';
                                            this.safeAcctInit.phoneIsCertified = opRes.phoneIsCertified || false;
                                            this.safeAcctInit.emailIsCertified = opRes.emailIsCertified || false;
                                        }
                                    });
                                    this.showContent = false;
                                    this.showPersonal = true;
                                    this.callConn("/SmartCampus__SystemManagement/1.0.0/getSubjectTypeSettings?subjectTypeCode=" + this.sysParams.subjectTypeCode, {}, "GET", (res) => {
                                        if (res.resp.code == '0' && res.data.length > 0) {
                                            let resp = res.data[0];
                                            this.userSetRule.psw_minLen = resp.resetPasswordMinLength > 0 ? resp.resetPasswordMinLength : 0;
                                            this.userSetRule.psw_maxLen = resp.resetPasswordMaxLength > 0 ? resp.resetPasswordMaxLength : 0;
                                            this.userSetRule.psw_UpLett = resp.resetPasswordUppercaseLetterRequired;
                                            this.userSetRule.psw_LowLett = resp.resetPasswordLowercaseLetterRequired;
                                            this.userSetRule.psw_Num = resp.resetPasswordNumberRequired;
                                            this.userSetRule.psw_SpecCharc = resp.resetPasswordSpecialCharacterRequired;
                                            this.userSetRule.psw_RepeatCharts = resp.resetPasswordMinNotRepeatCharts;
                                        }
                                    });
                                    break;
                                case 'about':
                                    this.about.loading = true;
                                    this.about.visible = true;
                                    this.callConn("SmartCampus__UnifiedPortal/1.0.0/getInstalledPackageInfo", {}, "GET", (res) => {
                                        if (res.resp.code == '0' && res.data.length > 0) {
                                            let abResp = res.data[0];
                                            let overAllPack = abResp.packageList.filter(pack => pack.tag == 'productInfo');
                                            this.about.overAllPackObj = overAllPack.length > 0 ? overAllPack[0] : {};
                                            this.about.packList = abResp.packageList.filter(pack => pack.tag != 'productInfo');
                                            this.about.loading = false;
                                        }
                                    });

                                    break;
                                case 'logout':
                                    this.callConn("/CM_Identity/0.1.0/logout", {}, "POST", (res) => { this.doLogout(); });
                                    break;
                                default:
                                    console.log("no match command");
                            }
                        },
						/**
						 * edit user pic
						 * @param {*} e 
						 */
                        editUserPic(e) {
                            const UPLOAD_IMAGE_TYPE_LIST = ['jpeg', 'png', 'gif', 'jpg'];
                            const MAX_IMAGE_SIZE_MB = 1;
                            //文件类型大小校验
                            let checkIndex = 0;
                            for (let i = 0; i < e.target.files.length; i++) {
                                let file = e.target.files[i];
                                if (UPLOAD_IMAGE_TYPE_LIST.indexOf(file.type.split("/")[1]) < 0) {
                                    this.showTips(this.lang.message.invalidImageType, "warning");
                                    break;
                                }
                                if (UPLOAD_IMAGE_TYPE_LIST.indexOf(file.type.split("/")[1]) >= 0 && (file.size / (MAX_IMAGE_SIZE_MB * 1024 * 1024)) > 1) {
                                    this.showTips(this.stringReplaceWithParam(this.lang.message.exceedImageSize, MAX_IMAGE_SIZE_MB), "warning");
                                    break;
                                }
                                checkIndex++;
                            }

                            if (checkIndex == e.target.files.length) {
                                this.userPicFile = [...e.target.files];
                                let reader = new FileReader();
                                reader.readAsDataURL(this.userPicFile[0]);
                                reader.onload = () => {
                                    this.acct.userPic = this.result;
                                }
                            }
                            this.$refs.inputImg.value = '';
                            this.handleUserset('save', 'basicInfo');
                        },
                        uploadImage(files) {
                            var promise = new Promise((resolve, reject) => {
                                HttpUtils.getCsrfToken((token) => {
                                    var execUpload = (fileList, i) => {
                                        var file = fileList[i];
                                        let params = {
                                            key: file.name
                                        };
                                        fetch('/service/SmartCampus__UnifiedPortal/1.0.0/queryUploadUrlHash', {
                                            method: 'POST',
                                            headers: {
                                                'csrf-token': token,
                                                'content-type': 'application/json'
                                            },
                                            body: JSON.stringify(params)
                                        }).then(r => { return r.json() })
                                            .then(data => {
                                                let hash = "";
                                                if (data['result'] && data['result'].length) {
                                                    hash = data['result'][0]['hash'].slice(0, 6) + "_";
                                                }
                                                var url = '/u-route/baas/sys/v1.1/connectors/objectstorageproxy/' + this.sysParams.PublicObjectStorageProxy + '/putobject?object=' + hash + 'UnifiedPortal/' + encodeURIComponent(file.name) + '&acl=public-read';
                                                var fr = new FileReader(); //FileReader对象  
                                                fr.onload = function (event) {
                                                    xhr.send(event.target.result);
                                                };
                                                fr.readAsArrayBuffer(file);
                                                var xhr = new XMLHttpRequest();
                                                xhr.open('post', url);
                                                xhr.setRequestHeader('csrf-token', token);
                                                xhr.onreadystatechange = () => {
                                                    //请求过程完毕
                                                    if (xhr.readyState === 4 && xhr.status == 200) {
                                                        if (JSON.parse(xhr.response).resCode === 0 || JSON.parse(xhr.response).resCode === "0") {
                                                            if (JSON.parse(xhr.response).result) {
                                                                //递归调用上传文件的方法
                                                                i++;
                                                                if (i < fileList.length) {
                                                                    execUpload(fileList, i);
                                                                } else {
                                                                    //上传完毕
                                                                    this.acct.userPic = this.imgPrefix + JSON.parse(xhr.response).result.object || "";
                                                                    resolve('success');
                                                                }
                                                            }
                                                        }
                                                    }
                                                };
                                            })
                                    };
                                    execUpload(files, 0);
                                });
                            });
                            return promise;
                        },
                        onBlur(key, value) {
                            switch (key) {
                                case 'psw':
                                    if (value) {
                                        let pswRule = this.userSetRule;
                                        if (pswRule.psw_minLen && value.length < pswRule.psw_minLen) {
                                            this.dataErr[key] = true;
                                            this.dataErrDesc[key] = this.stringReplaceWithParam(this.lang.rule.minLen, pswRule.psw_minLen);
                                            return false;
                                        }
                                        if (pswRule.psw_maxLen && value.length > pswRule.psw_maxLen) {
                                            this.dataErr[key] = true;
                                            this.dataErrDesc[key] = this.stringReplaceWithParam(this.lang.rule.maxLen, pswRule.psw_maxLen);
                                            return false;
                                        }
                                        if (pswRule.psw_UpLett) {
                                            var regMaxExp2 = /(?=.*?[A-Z])/;
                                            var resMax = (regMaxExp2.test(value)) ? true : false;
                                            if (!resMax) {
                                                this.dataErr[key] = true;
                                                this.dataErrDesc[key] = this.lang.rule.uppercase;
                                                return false;
                                            }
                                        }
                                        if (pswRule.psw_LowLett) {
                                            var regMinExp2 = /(?=.*?[a-z])/;
                                            var resMin = (regMinExp2.test(value)) ? true : false;
                                            if (!resMin) {
                                                this.dataErr[key] = true;
                                                this.dataErrDesc[key] = this.lang.rule.lowercase;
                                                return false;
                                            }
                                        }
                                        if (pswRule.psw_Num) {
                                            var regExp3 = /(?=.*\d)/;
                                            var result3 = (regExp3.test(value)) ? true : false;
                                            if (!result3) {
                                                this.dataErr[key] = true;
                                                this.dataErrDesc[key] = this.lang.rule.digit;
                                                return false;
                                            }
                                        }
                                        if (pswRule.psw_SpecCharc) {
                                            var regExp4 = /(?=.*?[`~!@#$%^&*()\-_=+\\|[{}\];:'",<.>/ ])/;
                                            var result4 = (regExp4.test(value)) ? true : false;
                                            if (!result4) {
                                                this.dataErr[key] = true;
                                                this.dataErrDesc[key] = this.lang.rule.specChar;
                                                return false;
                                            }
                                        }
                                        //判断两次密码输入                                
                                        if (value == this.acct.rePsw) {
                                            this.dataErr.rePsw = false;
                                            this.dataErrDesc.rePsw = "";
                                        } else if (this.acct.rePsw && value != this.acct.rePsw) {
                                            this.dataErr.rePsw = true;
                                            this.dataErrDesc.rePsw = this.lang.rule.pswValidate;
                                            return false;
                                        }
                                    }
                                    break;
                                case 'rePsw':
                                    if (value) {
                                        if (this.acct.psw) {
                                            var result = (value == this.acct.psw) ? true : false;
                                        }
                                        if (!result) {
                                            this.dataErr[key] = true;
                                            this.dataErrDesc[key] = this.lang.rule.pswValidate;
                                            return false;
                                        } else {
                                            this.dataErr[key] = false;
                                            this.dataErrDesc[key] = "";
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                        },
                        onInput(key) {
                            this.dataErr[key] = false;
                            this.dataErrDesc[key] = "";
                        },
                        handleBack() {
                            this.acct.name = this.originalName;
                            this.viewName = true;
                            this.showContent = true;
                            this.showPersonal = false;
                        },
                        handleUserset(type, mode) {
                            if (type == "cancel") {
                                this.acct.name = this.originalName;
                                this.viewName = true;
                                this.dataErr.name = false;
                                this.dataErrDesc.name = "";
                            } else {
                                let correctResp = false; //接口调用成功标志
                                if (mode == 'basicInfo') {
                                    if (!this.acct.name) {
                                        this.dataErr.name = true;
                                        this.dataErrDesc.name = this.lang.rule.enterName;
                                        return false;
                                    } else {
                                        if (this.acct.name.trim().length > 32 || this.acct.name.trim().length < 2) {
                                            this.dataErr.name = true;
                                            this.dataErrDesc.name = this.lang.userSetting.basicInfo.name.placeholder;
                                            return false;
                                        }
                                        let nameRegEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im;
                                        let nameRegCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
                                        if (nameRegEn.test(this.acct.name) || nameRegCn.test(this.acct.name)) {
                                            this.dataErr.name = true;
                                            this.dataErrDesc.name = this.lang.userSetting.basicInfo.name.placeholder;
                                            return false;
                                        }

                                    }
                                    const loading = this.$loading({
                                        lock: true,
                                        text: this.lang.modifying,
                                        spinner: 'el-icon-loading',
                                        background: 'rgba(0, 0, 0, 0.7)'
                                    });
                                    //校验通过
                                    if (this.userPicFile.length > 0) {
                                        this.uploadImage(this.userPicFile).then((reason) => {
                                            correctResp = this.modifyUserBasic();
                                            loading.close();
                                            if (correctResp) {
                                                this.showTips(this.lang.message.success, "success");
                                                this.viewName = true;
                                                this.userPicFile = [];  //上传后清空
                                            } else {
                                                this.showTips(this.lang.message.editError, "error");
                                            }
                                        });
                                    } else {
                                        correctResp = this.modifyUserBasic();
                                        loading.close();
                                        if (correctResp) {
                                            this.viewName = true;
                                        } else {
                                            this.showTips(this.lang.message.editError, "error");
                                        }
                                    }
                                }
                            }
                        },
                        modifyUserBasic() {
                            let name = this.acct.name;
                            let nickname = this.acct.nickname;
                            let basicReq = {
                                "async": false,
                                "logo": this.acct.userPic,
                                "name": name,
                                "nickName": nickname
                            };
                            var modifySucc = false;
                            this.callConn("/SmartCampus__SystemManagement/1.0.0/updateCurrentOperator", basicReq, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    this.originalName = this.acct.name;
                                    this.userPic = this.acct.userPic;
                                    modifySucc = true;
                                }
                            });
                            return modifySucc;
                        },

                        /**
                         * click up and down to srcroll menu item
                         */
                        menuScroll(type) {
                            let currTop = parseFloat($(".left-wrap").css('top')); //菜单wrap的top值
                            let upArrowHei = parseFloat($(".left-scrollTop").css('height')); //向上箭头的高度
                            let menuItemHei = parseFloat($(".dropdown").css('height')); //菜单项的高度

                            if (type == "top") {
                                if (Math.abs(currTop) > upArrowHei) {//至少要有一个菜单项
                                    $(".left-wrap").css('top', (currTop + menuItemHei) + 'px');
                                } else {
                                    $(".left-wrap").css('top', upArrowHei + 'px');
                                }
                            } else {
                                if (Math.abs(currTop) < (parseFloat($(".left-wrap").css('height')) - menuItemHei - upArrowHei)) {//至少要有一个菜单项
                                    $(".left-wrap").css('top', (currTop - menuItemHei) + 'px');
                                }
                            }
                        },

                        handleClose(done) {
                            this.$confirm(this.lang.userSetting.basicInfo.drawer.sure2Close, this.lang.information, {
                                confirmButtonText: this.lang.button.ok,
                                cancelButtonText: this.lang.button.cancel,
                                type: 'warning',
                                customClass: 'hw-messageBox'
                            }).then(_ => {
                                done();
                                this.$nextTick(() => {
                                    this.$refs['input_phOrEm'].resetFields();
                                    this.$refs['input_phOrEm'].clearValidate();
                                });
                            }).catch(_ => { });
                        },
                        /**
                         * 
                         * @param {动作-初始化、认证、完成} action 
                         * @param {类型-手机/邮箱} type 
                         * @param {场景-绑定、修改、解绑、认证} scenario 
                         */
                        async safeAcctSet(action, type, scenario) {
                            switch (action) {
                                case "goInit":
                                    this.drawer.drawerType = 'modiPhOrEm';
                                    this.drawer.show = true;
                                    this.drawer.activeIndex = 0;
                                    this.drawer.targetType = type;
                                    this.drawer.scenario = scenario;
                                    this.resetVfCodeInfo();
                                    this.getImgVerifyCode();
                                    this.input_phOrEm = { phone: '', email: '', psw: '', imageVfCode: '', verifyCode: '', verifyCodeMsg: this.lang.userSetting.basicInfo.drawer.verifyCodeGet, verifyCodeGet: false };

                                    if (scenario == 'addOrUp') {
                                        if (type == 'phone') {
                                            if (this.safeAcctInit.phone) {
                                                //变更
                                                if (this.safeAcctInit.phoneIsCertified || this.safeAcctInit.emailIsCertified) {
                                                    //有手机号且手机或邮箱其一标记已认证 
                                                    this.drawer.currStep = 'verify_phOrem';
                                                    this.drawer.verifyType = this.safeAcctInit.phoneIsCertified ? 'phone' : 'email';
                                                } else {
                                                    //有手机号但是均未认证 --- 进行密码校验
                                                    this.drawer.currStep = 'verify_psw';
                                                }
                                            } else {
                                                //新绑定
                                                if (this.safeAcctInit.email && this.safeAcctInit.emailIsCertified) {
                                                    this.drawer.currStep = 'verify_phOrem';
                                                    this.drawer.verifyType = 'email';
                                                } else {
                                                    this.drawer.currStep = 'verify_psw';
                                                }
                                            }
                                        }
                                        if (type == 'email') {
                                            if (this.safeAcctInit.email) {
                                                //变更
                                                if (this.safeAcctInit.phoneIsCertified || this.safeAcctInit.emailIsCertified) {
                                                    //有邮箱且手机或邮箱其一标记已认证 
                                                    this.drawer.currStep = 'verify_phOrem';
                                                    this.drawer.verifyType = this.safeAcctInit.emailIsCertified ? 'email' : 'phone';
                                                } else {
                                                    //有邮箱但是均未认证 --- 进行密码校验
                                                    this.drawer.currStep = 'verify_psw';
                                                }
                                            } else {
                                                //新绑定
                                                if (this.safeAcctInit.phone && this.safeAcctInit.phoneIsCertified) {
                                                    this.drawer.currStep = 'verify_phOrem';
                                                    this.drawer.verifyType = 'phone';
                                                } else {
                                                    this.drawer.currStep = 'verify_psw';
                                                }
                                            }
                                        }
                                    } else if (scenario == 'certify') {
                                        this.drawer.currStep = 'verify_phOrem';
                                        this.drawer.verifyType = type;
                                    }
                                    break;

                                case "goVerify":
                                    //密码、已认证字段校验
                                    if (this.drawer.scenario == 'addOrUp') {
                                        if (type == 'psw') {
                                            this.drawer.verifyBy = 'psw';
                                            if (this.callValidateInsPart('input_phOrEm', 'psw')) {
                                                return false;
                                            }
                                            if (!this.goVerifyPsw()) {
                                                this.$alert(this.lang.userSetting.basicInfo.drawer.wrongPsw, this.lang.error, {
                                                    type: "warning",
                                                    confirmButtonText: this.lang.button.ok,
                                                    customClass: 'hw-messagebox',
                                                    callback: () => { }
                                                });
                                                return false;
                                            }
                                        }
                                        if (type == 'phOrem') {
                                            this.drawer.verifyBy = 'phOrem';
                                            if (this.callValidateInsPart('input_phOrEm', 'verifyCode')) {
                                                return false;
                                            }
                                            if (!this.goVerifyExist()) {
                                                return false;
                                            }
                                            this.isDisabled = true;
                                            this.resetVfCodeInfo();
                                            this.input_phOrEm = { phone: '', email: '', psw: '', imageVfCode: '', verifyCode: '', verifyCodeMsg: this.lang.userSetting.basicInfo.drawer.verifyCodeGet, verifyCodeGet: false };
                                        }
                                        this.$nextTick(() => { //reset
                                            this.$refs['input_phOrEm'].resetFields();
                                            this.$refs['input_phOrEm'].clearValidate();
                                        });
                                        this.drawer.currStep = 'input';

                                    } else if (this.drawer.scenario == 'certify') {
                                        if (this.callValidateInsPart('input_phOrEm', 'verifyCode')) {
                                            return false;
                                        }
                                        if (!this.goCertify()) {
                                            return false;
                                        }

                                        if (this.drawer.verifyType == 'phone') {
                                            this.safeAcctInit.phoneIsCertified = true;
                                        } else {
                                            this.safeAcctInit.emailIsCertified = true;
                                        }
                                        this.drawer.currStep = 'complete';
                                    }

                                    this.getImgVerifyCode();
                                    this.goNextStep();
                                    break;

                                case "goComplete":
                                    //输入字段校验

                                    if (type == 'phone') {
                                        if (this.callValidateInsPart('input_phOrEm', 'phone')) {
                                            return false;
                                        }
                                    }
                                    if (type == 'email') {
                                        if (this.callValidateInsPart('input_phOrEm', 'email')) {
                                            return false;
                                        }
                                    }

                                    if (this.callValidateInsPart('input_phOrEm', 'verifyCode')) {
                                        return false;
                                    }

                                    if (!this.goVerifyAndUpdate(type)) {
                                        return false;
                                    }

                                    this.safeAcctInit[type] = this.input_phOrEm[type];
                                    if (type == 'phone') {
                                        this.safeAcctInit.phoneIsCertified = true;
                                    } else {
                                        this.safeAcctInit.emailIsCertified = true;
                                    }
                                    this.isDisabled = true;
                                    this.drawer.currStep = 'complete';
                                    this.goNextStep();
                                    break;
                                case "goCancel":
                                    if (type == 'closeDrawer') {
                                        this.$nextTick(() => {
                                            this.$refs['input_phOrEm'].resetFields();
                                            this.$refs['input_phOrEm'].clearValidate();
                                        });
                                        this.drawer.show = false;
                                    }
                                    this.goPreStep();
                                    break;
                                default:
                                    break;
                            }
                        },
                        goNextStep() {
                            if (this.drawer.activeIndex++ > 2) {
                                this.drawer.activeIndex = 0;
                            }
                        },
                        goPreStep() {
                            if (this.drawer.activeIndex-- < 0) {
                                this.drawer.activeIndex = 0;
                            }
                        },

                        //验证码阶段-校验
                        getVerifyCode(type) {
                            this.resetVfCodeInfo();
                            if (this.callValidateInsPart('input_phOrEm', 'imageVfCode')) {
                                return false;
                            }
                            let vfType = '';
                            switch (this.drawer.scenario) {
                                case 'addOrUp':
                                    vfType = 'safeAcctSet4PhoneOrEmail';
                                    break;
                                case 'certify':
                                    vfType = 'certifyCurPhoneOrEmail'
                                    break;
                                default:
                                    break;
                            }
                            let rvCodeReq = {
                                "receiver": this.safeAcctInit[type],
                                "receiverType": (type == 'phone') ? 'SMS' : 'Email',
                                "sendRandomVerifyCode": true,
                                "templateName": (type == 'phone') ? this.userSetParam.smsTemplate : this.userSetParam.emailTemplate,
                                "captchaCredential": this.input_phOrEm.imageVfCode,
                                "captchaType": "safeAcctSet",
                                "type": vfType
                            };

                            this.getImgVerifyCode();
                            this.callConn("/CM_Identity/0.1.0/getRandomVerifyCode", rvCodeReq, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    this.setFrontVfCode();
                                }
                            });
                        },

                        //验证是否被占用-校验
                        verifyPhoneOrEmailExist(type) {
                            let occupied = "";
                            if (type == "phone") {
                                occupied = this.lang.userSetting.basicInfo.drawer.phone + this.input_phOrEm[type] + this.lang.userSetting.basicInfo.drawer.occupied;
                            } else {
                                occupied = this.lang.userSetting.basicInfo.drawer.email + this.input_phOrEm[type] + this.lang.userSetting.basicInfo.drawer.occupied;
                            }
                            let rvCodeReq = {
                                "type": type,
                                "value": this.input_phOrEm[type]
                            };

                            this.callConn("/SmartCampus__SystemManagement/1.0.0/verifyPhoneOrEmailExist", rvCodeReq, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    if (res.data[0].occupied == false) {
                                        this.getInputCode(type);
                                    } else {
                                        this.$alert(occupied, this.lang.error, {
                                            type: "warning",
                                            confirmButtonText: this.lang.button.ok,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                    }
                                }
                            });
                        },

                        //验证码阶段-录入
                        getInputCode(type) {
                            if (type == 'phone') {
                                if (this.callValidateInsPart('input_phOrEm', 'phone')) {
                                    return false;
                                }
                            }
                            if (type == 'email') {
                                if (this.callValidateInsPart('input_phOrEm', 'email')) {
                                    return false;
                                }
                            }
                            let receiveTemp = (type == 'phone') ? this.userSetParam.smsTemplate : this.userSetParam.emailTemplate;
                            if (this.drawer.verifyBy == 'psw') {
                                if (this.callValidateInsPart('input_phOrEm', 'imageVfCode')) {
                                    return false;
                                }
                                let rvCodeReq = {
                                    "receiver": this.input_phOrEm[type],
                                    "receiverType": (type == 'phone') ? 'SMS' : 'Email',
                                    "sendRandomVerifyCode": true,
                                    "templateName": receiveTemp,
                                    "captchaCredential": this.input_phOrEm.imageVfCode,
                                    "captchaType": "safeAcctSet"
                                };

                                this.getImgVerifyCode();
                                this.callConn("/CM_Identity/0.1.0/getRandomVerifyCode", rvCodeReq, "POST", (res) => {
                                    if (res.resp.code == '0') {
                                        this.setFrontVfCode();
                                    }
                                });
                            }
                            if (this.drawer.verifyBy == 'phOrem') {
                                let rvCodeReq = `receiver=${this.input_phOrEm[type]}&validateType=safeAcctSet4PhoneOrEmail&templateName=${receiveTemp}&sendRandomVerifyCode=true`;
                                this.callConn("/CM_Identity/0.1.0/randomVerifyCode/distributed", rvCodeReq, "GET", (res) => {
                                    if (res.resp.code == '0') {
                                        this.setFrontVfCode();
                                    }
                                });
                            }
                        },

                        goVerifyPsw() {
                            let isRight = false;
                            this.callConn("/SmartCampus__SystemManagement/1.0.0/passwordIdentifaction", { password: this.input_phOrEm.psw, "async": false }, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    isRight = res.data[0].isConfirm || false;
                                }
                            });
                            return isRight;
                        },

                        /**
                         * 校验已认证的短信/邮箱验证码是否正确
                         */
                        goVerifyExist() {
                            let rmReq = {
                                async: false,
                                inputCode: this.input_phOrEm.verifyCode,
                                receiverType: (this.drawer.verifyType == 'phone') ? 'SMS' : 'Email',
                                type: 'safeAcctSet4PhoneOrEmail'
                            };
                            let verifyStatus = false;
                            this.callConn("/SmartCampus__SystemManagement/1.0.0/verifyCurPhoneOrEmail", rmReq, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    verifyStatus = res.data[0].verifyStatus || false;
                                }
                            });
                            return verifyStatus;
                        },

                        /**
                         * 校验新绑定或新变更信息并更新数据
                         */
                        goVerifyAndUpdate(type) {
                            let verifyBy = this.drawer.verifyBy;

                            let rmReq = {
                                async: false,
                                inputCode: this.input_phOrEm.verifyCode,
                                receiver: this.input_phOrEm[type],
                                receiverType: (type == 'phone') ? 'SMS' : 'Email'
                            };
                            if (verifyBy == 'psw') {
                                rmReq.password = this.input_phOrEm.psw;
                            }
                            if (verifyBy == 'phOrem') {
                                rmReq.type = 'safeAcctSet4PhoneOrEmail';
                            }
                            let rmRes = false;
                            this.callConn("/SmartCampus__SystemManagement/1.0.0/updateCurPhoneOrEmail", rmReq, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    rmRes = true;
                                    this.safeAcctInit[type] = this.input_phOrEm[type];
                                }
                            });
                            return rmRes;
                        },
                        /**
                         * 未认证字段做认证处理
                         */
                        goCertify() {
                            let cerReq = {
                                async: false,
                                inputCode: this.input_phOrEm.verifyCode,
                                receiverType: (this.drawer.verifyType == 'phone') ? 'SMS' : 'Email',
                                type: 'certifyCurPhoneOrEmail'
                            };
                            let cerRes = false;
                            this.callConn("/SmartCampus__SystemManagement/1.0.0/certifyCurPhoneOrEmail", cerReq, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    cerRes = true;
                                }
                            });
                            return cerRes;
                        },
                        callValidateInsPart(type, field) {
                            let hasError = false;
                            this.$refs[type].validateField(field, (err) => {
                                if (err) {
                                    console.log(err);
                                    hasError = true;
                                }
                            });
                            return hasError;
                        },
                        resetVfCodeInfo() {
                            if (this.drawer.sendInterval) {
                                clearInterval(this.drawer.sendInterval);
                            }
                        },
                        setFrontVfCode() {
                            let lastTime = 120;
                            this.input_phOrEm.verifyCodeGet = true;
                            this.isDisabled = false;
                            this.drawer.sendInterval = setInterval(() => {
                                lastTime--;
                                this.input_phOrEm.verifyCodeMsg = `${lastTime} ` + this.lang.seconds;
                                if (lastTime == 0) {
                                    this.input_phOrEm.verifyCodeMsg = this.lang.userSetting.basicInfo.drawer.verifyCodeGet;
                                    this.input_phOrEm.verifyCodeGet = false;
                                    clearInterval(this.drawer.sendInterval);
                                }
                            }, 1000);
                        },
                        getImgVerifyCode() {
                            this.drawer.imgCode = '/u-route/baas/sys/v1.0/verificationcode?type=' + 'safeAcctSet' + '&t=' + Date.parse(new Date());
                        },
                        modiCurPsw(type) {
                            if (type == 'goInit') {
                                this.drawer.show = true;
                                this.drawer.drawerType = 'modiPsw';
                                this.acct.oriPsw = ''; this.acct.psw = ''; this.acct.rePsw = '';
                                this.dataErr.oriPsw = false; this.dataErr.psw = false; this.dataErr.rePsw = false;
                                this.dataErrDesc.oriPsw = ''; this.dataErrDesc.psw = ''; this.dataErrDesc.rePsw = '';
                            }
                            if (type == 'goCancel') {
                                this.$nextTick(() => {
                                    this.$refs['input_phOrEm'].resetFields();
                                    this.$refs['input_phOrEm'].clearValidate();
                                });
                                this.drawer.show = false;
                            }
                            if (type == 'goSave') {
                                if (!this.acct.oriPsw) {
                                    this.dataErr.oriPsw = true;
                                    this.dataErrDesc.oriPsw = this.lang.userSetting.passwordChange.oriPsw.required;
                                    return false;
                                }
                                if (!this.acct.psw) {
                                    this.dataErr.psw = true;
                                    this.dataErrDesc.psw = this.lang.userSetting.passwordChange.psw.required;
                                    return false;
                                }
                                if (!this.acct.rePsw) {
                                    this.dataErr.rePsw = true;
                                    this.dataErrDesc.rePsw = this.lang.userSetting.passwordChange.rePsw.required;
                                    return false;
                                }
                                if (this.acct.rePsw != this.acct.psw) {
                                    this.dataErr.rePsw = true;
                                    this.dataErrDesc.rePsw = this.lang.userSetting.passwordChange.rePsw.confirm;
                                    return false;
                                }
                                if (!(this.dataErr.oriPsw || this.dataErr.psw || this.dataErr.rePsw)) {
                                    //调接口(修改密码)
                                    let pswReq = {
                                        "oldPassword": this.acct.oriPsw,
                                        "newPassword": this.acct.psw,
                                        "identityId": this.identityId
                                    };
                                    $('#savePassword').attr("disabled", true);
                                    this.callConn("/SmartCampus__SystemManagement/1.0.0/changeOperatorPassword", pswReq, "POST", (res) => {

                                        if (res.resp.code == '0') {
                                            this.showTips(this.lang.message.pswChangeSuccess, "success");
                                            setTimeout(() => {
                                                this.userSet('logout');
                                            }, 3000);
                                        } else {
                                            this.showTips(res.resp.message, "error");
                                        }
                                        $('#savePassword').removeAttr("disabled");
                                    });
                                }
                            }

                        },

                        /***************************************************国际化**************************************************/

                        changeElementUILocale(locale) {
                            switch (locale) {
                                case "en-US":
                                    ELEMENT.locale(ELEMENT.lang.en); break;
                                case "zh-CN":
                                    ELEMENT.locale(ELEMENT.lang.zhCN); break;
                                default:
                                    ELEMENT.locale({ "el": this.lang.el != undefined ? this.lang.el : ELEMENT.lang.en }); break;
                            }
                        },
                        getUserLocale() {
                            if (!this.sysParams.multiLangConf) { return; }
                            let currLocale = '';
                            if (window.localStorage.getItem('locale')) {
                                currLocale = window.localStorage.getItem('locale');
                            }
                            else if (navigator.language || navigator.userLanguage) {
                                currLocale = navigator.language || navigator.userLanguage;
                            }
                            currLocale = -1 != currLocale.indexOf('zh') ? 'zh_CN' : (-1 != currLocale.indexOf('en') ? 'en_US' : 'zh_CN');
                            this.mapLocale(currLocale);
                        },
                        mapLocale(locale) {
                            switch (locale) {
                                case 'zh_CN':
                                    this.locale.selLocale = '中文'; this.locale.noSelLocale = 'EN'; this.locale.noSelLang = 'en_US';
                                    break;
                                case 'en_US':
                                    this.locale.selLocale = 'EN'; this.locale.noSelLocale = '中文'; this.locale.noSelLang = 'zh_CN';
                                    break;
                                default:
                                    return;
                            }
                        },

                        toggleLang(type) {
                            switch (type) {
                                case 'zh_CN':
                                    this.locale.selLocale = '中文'; this.locale.noSelLocale = 'EN'; this.locale.noSelLang = 'en_US';
                                    window.localStorage.setItem('locale', 'zh_CN');
                                    break;
                                case 'en_US':
                                    this.locale.selLocale = 'EN'; this.locale.noSelLocale = '中文'; this.locale.noSelLang = 'zh_CN';
                                    window.localStorage.setItem('locale', 'en_US');
                                    break;
                                default:
                                    return;
                            }
                            this.callAjax('/u-route/baas/sys/v1.0/changelocale', 'POST', false, { languageLocaleKey: type }, (res) => { });
                            window.location.reload();
                        },

                        /*********************************************************系统参数***********************************************************/

                        async getSysParameter() {
                            let relaReq = {
                                UnifiedPortal_Mainframe_LogoUrl: "logoUrl",
                                UnifiedPortal_Mainframe_LogoUrl_En: "logoUrl_En",
                                UnifiedPortal_Mainframe_SpaceLevelsForCurrentArea: "spaceLevelConf",
                                UnifiedPortal_Mainframe_IsAllowSwitchLanguage: "multiLangConf",
                                UnifiedPortal_Mainframe_IsAllowSwitchSpace: "spaceAllow",
                                UnifiedPortal_Mainframe_LoginUrl: "loginUrl",
                                UnifiedPortal_Mainframe_SpaceRootCode: "spaceRootCode",
                                SubjectTypeCode: "subjectTypeCode",
                                UnifiedPortal_Mainframe_DefaultSelectedSpace: "defaultSelCode",
                                ObjectStorageProxy: "ObjectStorageProxy",
                                PublicObjectStorageProxy: "PublicObjectStorageProxy",
                                DefaultLanguage: "defaultLanguage",
                                SystemManagement_SingleSignOnHost: "ssoUrlPrefix",
                                SystemManagement_SingleSignOnAppId: "ssoAppId",
                                UnifiedPortal_CopyRightInfo: "copyRight",
                                UnifiedPortal_BrowserTitle: "browserTitle",
                                UnifiedPortal_BrowserTitle_En: "browserTitle_En",
                                UnifiedPortal_Mainframe_IsAllowDisplayAlarm: "alarmConf",
                                UnifiedPortal_Mainframe_AlarmPopupDuration: "alarmDuration",
                                UnifiedPortal_Mainframe_AlarmContentConfig: "alarmContent"
                            };
                            let paraValueReq = [];
                            let callSysPara = async (req) => {
                                return new Promise(resolve => {
                                    this.callConn("/SmartCampus__SystemManagement/1.0.0/getSCBasicSystemParameter", { paraNameList: req }, "POST", (res) => {
                                        if (res.resp.code == '0') {
                                            paraValueReq = res.data[0].paraValueList || [];
                                        }
                                        resolve(paraValueReq);
                                    });
                                });
                            };
                            let paraValueList = await callSysPara(Object.keys(relaReq)) || [];

                            let logoUrl = '', logoUrlEn = '';
                            paraValueList.length > 0 && paraValueList.forEach(paraIt => {
                                let sysVal = relaReq[paraIt.name] || "";
                                if (!sysVal) {
                                    return false;
                                }
                                this.sysParams[sysVal] = paraIt.value || '';
                                switch (paraIt.name) {
                                    case "UnifiedPortal_Mainframe_LogoUrl":
                                        logoUrl = paraIt.value || '';
                                        break;
                                    case "UnifiedPortal_Mainframe_LogoUrl_En":
                                        logoUrlEn = paraIt.value || '';
                                        break;
                                    case "UnifiedPortal_Mainframe_SpaceLevelsForCurrentArea":
                                        if (paraIt.value) {
                                            this.spLevList = paraIt.value.split(";");
                                            this.spLevList.map(value => { return value.trim() });
                                        }
                                        break;
                                    case "UnifiedPortal_Mainframe_IsAllowSwitchLanguage":
                                        paraIt.value && this.getUserLocale();
                                        break;
                                    default:
                                        break;
                                }
                            });
                            this.imgPrefix = `/u-route/baas/sys/v1.1/connectors/objectstorageproxy/${this.sysParams.PublicObjectStorageProxy}/viewobject?object=`
                            this.sysParams.logoUrl = this.imgPrefix + logoUrl || '';
                            if (window.localStorage.getItem('locale') == "zh_CN") {
                                this.sysParams.logoUrl = this.imgPrefix + logoUrl || '';
                            }
                            else {
                                this.sysParams.logoUrl = this.imgPrefix + logoUrlEn || '';
                            }
                            this.getBrowserInfo();
                        },

                        async getUserSetSysParameter() {
                            let relaReq = {
                                "SystemManagement_SMSTemplateName": "smsTemplate",
                                "SystemManagement_EmailTemplateName": "emailTemplate",
                                "SystemManagement_PhoneNumberRules": "phoneRule",
                                "SystemManagement_EmailRules": "emialRule"
                            };
                            let paraValueReq = [];
                            let callSysPara = async (req) => {
                                return new Promise(resolve => {
                                    this.callConn("/SmartCampus__SystemManagement/1.0.0/getSCBasicSystemParameter", { paraNameList: req }, "POST", (res) => {
                                        if (res.resp.code == '0') {
                                            paraValueReq = res.data[0].paraValueList || [];
                                        }
                                        resolve(paraValueReq);
                                    });
                                });
                            };
                            let paraValueList = await callSysPara(Object.keys(relaReq)) || [];
                            paraValueList.length > 0 && paraValueList.forEach(paraIt => {
                                let sysVal = relaReq[paraIt.name] || "";
                                if (!sysVal) { return false; }
                                this.userSetParam[sysVal] = paraIt.value || '';
                            });
                            this.userSetParam["phoneRule"] && this.safeAcctVerifyRule.phone.push({
                                validator: (rule, value, callback) => {
                                    let phoneReg = new RegExp(this.userSetParam["phoneRule"]);
                                    !value.match(phoneReg) && callback(new Error(this.lang.userSetting.basicInfo.drawer.correctPhoneInput));
                                    callback();
                                }, trigger: 'blur'
                            });
                            this.userSetParam["emialRule"] && this.safeAcctVerifyRule.email.push({
                                validator: (rule, value, callback) => {
                                    let emailReg = new RegExp(this.userSetParam["emialRule"]);
                                    !value.match(emailReg) && callback(new Error(this.lang.userSetting.basicInfo.drawer.correctEmailInput));
                                    callback();
                                }, trigger: 'blur'
                            })
                        },

                        /*********************************************************公共***********************************************************/

                        //call customapi by apiConnector
                        callConn: function (service, param, type, callbackFunc) {
                            var _this = this;
                            var connector = null;
                            switch (type.toUpperCase()) {
                                case 'POST': connector = thisObj.getConnectorInstanceByName('APIConnector_POST'); break;
                                case 'GET': connector = thisObj.getConnectorInstanceByName('APIConnector_GET'); break;
                                case 'PUT': connector = thisObj.getConnectorInstanceByName('APIConnector_PUT'); break;
                                case 'DELETE': connector = thisObj.getConnectorInstanceByName('APIConnector_DELETE'); break;
                                default: connector = thisObj.getConnectorInstanceByName('APIConnector_POST'); break;
                            }
                            if (connector) {
                                connector.setInputParams({ service: service, needSchema: 'data' });	//异步（默认）
                                if (param.async === false) {
                                    connector.setInputParams({ service: service, needSchema: 'data', async: false });	//同步
                                    delete param.async;
                                }
                                connector
                                    .query(param)
                                    .done(function (response) {
                                        if (response.resp && response.resp.code) {
                                            callbackFunc.call(_this, response);
                                        }
                                    })
                                    .fail(function (response) {
                                        _this.$alert(response.response.resMsg, _this.lang.error, {
                                            type: "warning",
                                            confirmButtonText: _this.lang.button.ok,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                        switch (service) {
                                            case '/SmartCampus__SystemManagement/1.0.0/changeOperatorPassword':
                                                $('#savePassword').removeAttr("disabled");
                                                break;
                                            case '/CM_Identity/0.1.0/logout':
                                                this.doLogout();
                                                break;
                                            case '/SmartCampus__UnifiedPortal/1.0.0/verifyLogin':
                                                setTimeout(function () {
                                                    if (_this.sysParams.loginUrl) {
                                                        location.href = _this.sysParams.loginUrl;
                                                    }
                                                }, 3000);
                                                break;
                                            default:
                                                break;
                                        }

                                    })
                            } else {
                                if (service == '/SmartCampus__UnifiedPortal/1.0.0/verifyLogin') {
                                    if (_this.sysParams.loginUrl) {
                                        location.href = _this.sysParams.loginUrl;
                                    }
                                }
                            }
                        },

                        callAjax(url, type, syncFlag, request, callFunc) {
                            HttpUtils.getCsrfToken(function (token) {
                                $.ajax({
                                    url: url,
                                    type: type,
                                    headers: {
                                        "Content-Type": "application/json",
                                        "csrf-token": token
                                    },
                                    async: syncFlag,
                                    data: JSON.stringify(request) == '{}' ? '' : JSON.stringify(request),
                                    success: callFunc
                                });
                            });
                        },

                        showTips(msg, type, duration) {
                            this.$message({
                                message: msg,
                                type: type || '',
                                customClass: 'hw-message',
                                duration: (duration || duration == 0) ? duration : 3000,
                                showClose: true
                            });
                        },
                        //show or hide top and left navi
                        toggleFullScreen() {
                            this.fullScreen = !this.fullScreen;
                            this.fullScreenIcon = this.fullScreen ? widgetBasePath + "image/icon-e.png" : widgetBasePath + "image/icon-f.png";
                        },

                        doLogout() {
                            let currentLoginMode = window.localStorage.getItem("SM_CurrentLoginMode");
                            if (currentLoginMode == 'IAM') {
                                let loginPageUrl = location.origin + this.sysParams.loginUrl;
                                let logoutUrl = this.sysParams.ssoUrlPrefix + '/idp/profile/SAML2/Redirect/GLO?entityId=' + this.sysParams.ssoAppId + '&redirctToUrl=' + loginPageUrl + '&redirectToLogin=true';
                                location.href = logoutUrl;
                            } else {
                                location.href = this.sysParams.loginUrl;
                            }
                            sessionStorage.clear();
                        },

                        getBrowserInfo() {
                            //Following code is about page title and supporting internalization.
                            if (window.localStorage.getItem('locale') == "zh_CN") {
                                $("head title").html(this.sysParams.browserTitle);
                            } else {
                                $("head title").html(this.sysParams.browserTitle_En);
                            }
                        },
						/**
						 * Calculate whether the menu can be scrolled 
						 */
                        menuScrollInit() {
                            this.screenHeight = document.body.clientHeight - parseFloat($(".up-top").css("height"));
                            let allMenuLen = parseFloat($(".left-wrap").css("height"));
                            if (this.screenHeight < allMenuLen) {
                                this.showMenuScroll = true;
                                $(".left-wrap").css('top', $(".left-scrollTop").css("height"));
                            } else {
                                this.showMenuScroll = false;
                                $(".left-wrap").css('top', '0');
                            }
                        },
                        redictLogin() {
                            if (this.sysParams.loginUrl) {
                                location.href = this.sysParams.loginUrl;
                            }
                            return false;
                        },
                        stringReplaceWithParam(destination, ...params) {
                            let result = destination;
                            params.forEach((p, key) => {
                                result = result.replace("{" + key + "}", p);
                            })
                            return result;
                        },
                        judgeUserProfile(opInfo) {
                            if (!(opInfo.phoneNumber || opInfo.email)) {
                                this.showNotify(this.lang.message.warmReminder, this.lang.message.noPhoneAndEmailTip, 8000);
                            } else if (!(opInfo.phoneIsCertified || opInfo.emailIsCertified)) {
                                this.showNotify(this.lang.message.warmReminder, this.lang.message.noCertifyTips, 8000);
                            }
                        },
                        showNotify(title, message, duration) {
                            this.$notify({
                                title: title,
                                message: message,
                                customClass: 'hw-notify',
                                duration: duration || 0,
                                iconClass: 'el-icon-warning-outline',
                                offset: 37
                            });
                        }
                    }
                });
            }

            thisObj.sksBindItemEvent();
            $(window).resize(function () {
                thisObj.sksRefreshEvents();
            });
        }
    }
);