var HmPersonManagement = StudioWidgetWrapper.extend({
    /*
     * Triggered when initializing a widget and will have the code that invokes rendering of the widget
     */
    init: function () {
        var thisObj = this;
        thisObj._super.apply(thisObj, arguments);
        thisObj.render();
        if ((typeof (Studio) != "undefined") && Studio) {
            Studio.registerEvents(thisObj, "openModel", "Open BatchImport", []);
        }
    },

    /*
     * Triggered from init method and is used to render the widget
     */
    render: function () {
        var thisObj = this;
        var elem = thisObj.getContainer();

        /*
         * API to get base path of your uploaded widget API file
         */
        var widgetBasePath = thisObj.getWidgetBasePath();
        if (elem) {
            var containerDiv = $(".scfClientRenderedContainer", elem);
            if (containerDiv.length) {
                $(containerDiv).empty();
            } else {
                containerDiv = document.createElement('div');
                containerDiv.className = "scfClientRenderedContainer";
                $(elem).append(containerDiv);
            }

            var i18n = HttpUtils.getI18n({
                locale: HttpUtils.getLocale(),
                messages: thisObj.getMessages()
            });

            thisObj.vm = new Vue({
                el: $("#personmanagement", elem)[0],
                i18n: i18n,
                data() {
                    // 校验密码
                    var validatePassword = (rule, value, callback) => {
                        let pswRule = this.userSetRule;
                        if (value === '') {
                            callback(new Error(this.lang.createPassword.psw.placeholder));
                        } else if (pswRule.psw_minLen && value.length < pswRule.psw_minLen) {
                            // 校验密码最小长度
                            callback(new Error(this.stringReplaceWithParam(this.lang.createPassword.rule.minLen, pswRule.psw_minLen)));
                        } else if (pswRule.psw_maxLen && value.length > pswRule.psw_maxLen) {
                            // 校验密码最大长度
                            callback(new Error(this.stringReplaceWithParam(this.lang.createPassword.rule.maxLen, pswRule.psw_maxLen)));
                        } else if (pswRule.psw_LowLett) {
                            // 校验必须有小写
                            let regExp2 = /(?=.*?[a-z])/;
                            let result2 = (regExp2.test(value)) ? true : false;
                            if (!result2) {
                                callback(new Error(this.lang.createPassword.rule.lowercase));
                            }
                        }
                        if (pswRule.psw_UpLett) {
                            // 校验必须有大写
                            let regExp1 = /(?=.*?[A-Z])/;
                            let result1 = (regExp1.test(value)) ? true : false;
                            if (!result1) {
                                callback(new Error(this.lang.createPassword.rule.uppercase));
                            }
                        }
                        if (pswRule.psw_Num) {
                            // 校验必须有数字
                            let regExp3 = /(?=.*\d)/;
                            let result3 = (regExp3.test(value)) ? true : false;
                            if (!result3) {
                                callback(new Error(this.lang.createPassword.rule.digit));
                            }
                        }
                        if (pswRule.psw_SpecCharc) {
                            // 校验必须有特殊字符
                            let regExp4 = /(?=.*?[`~!@#$%^&*()\-_=+\\|[{}\];:'",<.>/ ])/;
                            let result4 = (regExp4.test(value)) ? true : false;
                            if (!result4) {
                                callback(new Error(this.lang.createPassword.rule.specChar));
                            }
                        }
                        callback();
                    };
                    // 校验确认密码 
                    var validateRepeatPassword = (rule, value, callback) => {
                        if (value === '') {
                            callback(new Error(this.lang.createPassword.rePsw.placeholder));
                        } else if (value !== this.operatorPasswordFrom.password) {
                            callback(new Error(this.lang.createPassword.rePsw.confirm));
                        } else {
                            if (this.operatorPasswordFrom.repeatPassword && this.operatorPasswordFrom.repeatPassword == this.operatorPasswordFrom.password) {
                                this.personInfoForm.operatorInfo.password = this.operatorPasswordFrom.repeatPassword;
                            }
                            callback();
                        }
                    };
                    // 校验姓名
                    var validatePersonName = (rule, value, callback) => {
                        if (!value) {
                            callback(new Error(this.lang.enterName));
                        }
                        let regExp = /^[\u4e00-\u9fa5_a-zA-Z\s]+$/;
                        let validateResult = regExp.test(value);
                        if (!validateResult) {
                            callback(new Error(this.lang.personNameReg));
                        }
                        let nameBytes = this.getBytes(value);
                        if (nameBytes > 64) {
                            callback(new Error(this.lang.personNameLength));
                        }
                        callback();
                    }
                    var validatePersonNameEn = (rule, value, callback) => {
                        let regExp = /^[a-zA-Z\s]+$/;
                        if (value) {
                            let validateResult = regExp.test(value);
                            if (!validateResult) {
                                callback(new Error(this.lang.personNameENReg));
                            }
                            let nameBytes = this.getBytes(value);
                            if (nameBytes > 64) {
                                callback(new Error(this.lang.personNameENLength));
                            }
                        } else if (!value && this.personInfoFormRules['person.personNameEn'][0].required) {
                            callback(new Error(this.lang.enterEnglishName));
                        }
                        callback();
                    }
                    return ({
                        "hmCenter":"",
                        "orgName":{"name":""},
                        "pagination": false,
                        "lang": {},
                        "activeName": "personOrganization",
                        "dropdownOpen": false,
                        "dropdownClose": true,
                        "searchWord": "",
                        "personName": "",
                        "checked": false,
                        "maxPersonGroup": 5,
                        "wrapperClosable": false,
                        "iconEdit": widgetBasePath + "images/edit.png",
                        "iconDelete": widgetBasePath + "images/delete.png",
                        "defaultImage": widgetBasePath + "images/defaultimage.png",
                        "currentPage": 1,
                        "pageSizes": [10, 20, 30, 40],
                        "pageSize": 10,
                        "personAttr": [],
                        "sendRequest": true,
                        "organizations": [],
                        "currentOperatorOrgIds": [],
                        "organizationRootList": [],
                        "checkedPerson": [],
                        "isDisabled": false,
                        "typeList": [],
                        "addFaceId": [],
                        "leaf": "leaf",
                        "orgProps": {
                            "value": "id",
                            "label": "organizationName",
                            "checkStrictly": true
                        },
                        "queryStart": 0,
                        // 显示抽屉
                        "showPersonInfoDrawer": false,
                        "hideAtribute": false,
                        "hasSuperPermission": false,
                        "addIdentityDisable": true,
                        "addLicenseDisable": false,
                        "addOrganizationDisable": false,
                        "groupDescMaxlength": 255,
                        "configList": {},
                        "disabled": false,
                        "isFilterPersonBasedOnOrg": false, //是不是开启组织过滤
                        "groupPageSize": 50,
                        "groupCurrentPage": 1,
                        "isLoading": true,
                        "groupTotalSize": 0,
                        "showPersonGroupDialog": false,
                        "personGroupType": [],
                        "currentOperatorOrgTree": [],
                        "showLookGroupDialog": false,
                        "allPersonGroup": [],
                        "personGender": [],
                        "personGroupTitle": "",
                        "defaultExpandOrgTreeKey": [],
                        "personList": [],
                        "objectProxy": "",
                        "portalUserInfo": [],
                        "portalUserId": "",
                        "personTotalSize": 0,
                        "defaultHeadPortrait": "",
                        "noHeadPortrait": "",
                        "identityTypeList": [],
                        "personTypeList": [],
                        "personAttrList": [],
                        "storageType": "",
                        "imgUrl": "",
                        "notHasModify": false,
                        // 用户又创建操作员的权限
                        "hasCreateOperatorPermission": true,
                        "drawwerTitle": "",
                        // 修改状态
                        "isModifyPerson": false,
                        // 新增状态
                        "isAddPerson": false,
                        "isChecked": false,
                        "orgInsObj": {},
                        "queryPersonParam": {
                            "start": 0,
                            "limit": 10,
                            "condition": {}
                        },
                        "pickerOptions": {
                            disabledDate(time) {
                                return time.getTime() > Date.now();
                            },
                        },
                        "personInfoForm": {
                            "personPictures": [],
                            "person": {
                                "typeCode": null,
                                "personName": null,
                                "personNameEn": null,
                                "gender": null,
                                "status": null,
                                "dateOfBirth": null,
                                "personGroup": []
                            },
                            "personLocation": {},
                            "personVehicle": [],
                            "personOrganization": [],
                            "personIdentity": [],
                            "personAttribute": [],
                            "operatorInfo": {
                                "createOperatorFlag": false,
                                "password": null
                            }
                        },
                        "personGroupFormRules": {
                            "groupName": [{
                                required: true,
                                message: '请输入人员群组名称',
                                trigger: 'blur'
                            },
                            {
                                pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
                                message: '请填写非特殊字符的名称',
                            }
                            ],
                            "groupType": [{
                                required: true,
                                message: '请选择人员群组类型',
                                trigger: 'change'
                            }]
                        },
                        "isHasimg": false,
                        "personInfoFormRules": {
                            "person.personName": [{
                                validator: validatePersonName,
                                required: true,
                                trigger: 'blur'
                            }
                            ],
                            "person.personNameEn": [{
                                validator: validatePersonNameEn,
                                trigger: 'blur',
                                required: false
                            }],
                            "person.typeCode": [{
                                required: true,
                                message: '请选择人员类型',
                                trigger: ['blur', 'change']
                            }],
                            "person.gender": [{
                                required: true,
                                message: '请选择性别',
                                trigger: ['blur', 'change']
                            }]

                        },
                        "currentOperatorOrg": [], //登录操作员的组织
                        "currentOperatorPermissions": [],
                        "searchGroupKeyword": "",
                        "searchOrganizationWord": "",
                        "timer": null,
                        "uploadFileList": [],
                        "personGroupForm": {
                            "groupName": "",
                            "groupType": "",
                            "groupDesc": ""
                        },
                        "personGroupData": [{
                            id: 1,
                            label: '人员群组列表',
                            expand: true,
                            children: []
                        }],
                        "operatorPasswordFrom": {
                            "password": "",
                            "repeatPassword": ""
                        },
                        "operatorPasswordRules": {
                            "password": [{
                                validator: validatePassword,
                                required: true,
                                trigger: ['blur', 'change']
                            }],
                            "repeatPassword": [{
                                validator: validateRepeatPassword,
                                required: true,
                                trigger: ['blur', 'change']
                            }]
                        },
                        "userSetRule": {
                            "psw_minLen": null,
                            "psw_maxLen": null,
                            "psw_UpLett": false,
                            "psw_LowLett": false,
                            "psw_Num": false,
                            "psw_SpecCharc": false,
                            "psw_RepeatCharts": null
                        },
                        // 业务用户禁用
                        "portalUserDiasabled": false,
                        // 创建用户勾选框置灰
                        "createOperatorFlagDiasabled": false,
                        // 系统参数
                        "isConfigPassword": false,
                        // 系统参数 SystemManagement_PhoneNumberRules
                        "phoneNumberRules": '',
                        "operaorPermissionResources": [],
                        // 隐藏创建用户按钮
                        "showCreatOperatorBut": true,
                        "phone": "",
                        "hasPortalUser": false,
                        // 是否有全人员管理权限
                        "managePersonSuperPermissionFlag": false,
                        faceImageUrl: [],
                        orgParam:{
                            "condition": {},
                            "limit": 5000,
                            "start": 0
                        },



                        tableData: [{
                            date: '2016-05-02',
                            name: '王小虎',
                            address: '上海市普陀区金沙江路 1518 弄'
                          }, {
                            date: '2016-05-04',
                            name: '王小虎',
                            address: '上海市普陀区金沙江路 1517 弄'
                          }, {
                            date: '2016-05-01',
                            name: '王小虎',
                            address: '上海市普陀区金沙江路 1519 弄'
                          }, {
                            date: '2016-05-03',
                            name: '王小虎',
                            address: '上海市普陀区金沙江路 1516 弄'
                          }]
                    })
                },
                created() {
                    this.lang = i18n.messages[i18n.locale] || i18n.messages["en-US"];
                    this.personGroupFormRules.groupName[0].message = this.lang.enterGroupName;
                    this.personGroupFormRules.groupName[1].message = this.lang.enterNonSpecialCharacters;
                    this.personGroupFormRules.groupType[0].message = this.lang.selectPersonGroupType;
                    this.personInfoFormRules["person.typeCode"][0].message = this.lang.selectPersonType;
                    this.personInfoFormRules["person.gender"][0].message = this.lang.selectGender;
                    this.personGroupData[0].label = this.lang.personGroupList;
                    this.pageInit();
                    this.userSet();
                },
                mounted() {
                    this.querySystemParam();
                    // this.showOrganizationTree(org={
                    //     id: "0E01000000j77kw0tRMu",
                    //         organizationName: "华贸中心"
                    //     })
                        // this.toggleDropdown()
                    this.lang = i18n.messages[i18n.locale] || i18n.messages["en-US"];
                    this.changeElementUILocale(HttpUtils.getLocale());
                    this.pagination = true;
                    const _this = this;
                    this.queryPersonGroupList(this.groupCurrentPage);
                    let goupTree = this.$refs['groupTree'];
                    goupTree.$el.children[0].children[1].onscroll = function () {
                        if (_this.isLoading) {
                            let distance = this.scrollHeight - this.scrollTop - this.clientHeight;
                            if (distance < 50) {
                                if (_this.groupCurrentPage <= _this.groupTotalSize) {
                                    _this.groupCurrentPage++;
                                    _this.queryPersonGroupList(_this.groupCurrentPage);
                                }
                            }
                        }
                    }
                    this.queryPersonTypeList();
                    this.queryAllPersonGroup();
                    window.addEventListener('beforeunload', e => {
                        if (this.faceImageUrl.length) {
                            this.deleteImageFromObjectStorage(this.faceImageUrl)
                        }
                    });
                    // this.showOrganizationTree('0E01000000j77kw0tRMu') 
                    // this.queryOrganizationTree('0E01000000j77kw0tRMu',true);

                },
                //hgzz
                methods: {
                    querySystemParam(){
                        var _this = this
                        let params = {
                            "params": ["hm_bigScreen__HM_Center"]
                        };
                        this.callConn("/SmartCampus__FacilityManagement/0.1.0/SystemParams/query", params, 'POST', function (vm) {
                            if (vm && vm.resp && vm.resp.code == '0') {
                                const data = vm.data.value;
                                _this.hmCenter = data['hm_bigScreen__HM_Center'];
                                this.showOrganizationTree(org={
                                    id: _this.hmCenter,
                                        organizationName: "华贸中心"
                                    })
                            }
                        })
                    },
                    changeElementUILocale(locale) {
                        switch (locale) {
                            case "en-US":
                                ELEMENT.locale(ELEMENT.lang.en);
                                break;
                            case "zh-CN":
                                ELEMENT.locale(ELEMENT.lang.zhCN);
                                break;
                            default:
                                ELEMENT.locale({
                                    "el": this.lang.el != undefined ? this.lang.el : ELEMENT.lang.en
                                });
                                break;
                        }
                    },
                    //页面初始化方法
                    async pageInit() {
                        let identityId = sessionStorage.getItem('IdentityId');
                        this.configList = await this.getSysParam();
                        this.isFilterPersonBasedOnOrg = this.configList["Common_ManageByOperatorOrg"] || false;
                        this.isDisabled = false;
                        this.hasSuperPermission = false;
                        this.getObjectProxy().then(objectProxy => {
                            this.objectProxy = objectProxy;
                            this.noHeadPortrait = this.objectProxy + this.configList["PersonManagement_NoHeadPortrait"];
                            this.defaultHeadPortrait = this.objectProxy + this.configList["DefaultHeadPortrait"];
                        });
                        this.maxPersonGroup = this.configList["PersonBo_MaxNumberOfPersonGroup"] || 5;
                        this.maxPersonOrganization = this.configList["PersonBO_MaxNumberOfOrganization"] || 5;
                        this.maxPersonVehicle = this.configList["PersonBO_MaxNumberVehicle"] || 5;
                        this.isConfigPassword = this.configList["SystemManagement_IsConfigPassword"] || false;
                        this.phoneNumberRules = this.configList["SystemManagement_PhoneNumberRules"];
                        const PersonGroupTypePicklistId = "0004000000000000004L";
                        const personGenderPicklistId = "000400000000000I0003";
                        const connecterId = "003W000000RWjQ9s3mPA";
                        this.getPicklist(PersonGroupTypePicklistId).then(groupType => {
                            this.personGroupType = groupType;
                        })
                        this.getPicklist(personGenderPicklistId).then(personGender => {
                            this.personGender = personGender;
                        })
                        this.getStorageType(connecterId).then(type => {
                            this.storageType = type;
                        });
                        //如果不是bingo用户，需要调用查询操作员权限的接口,判断当前操作员的业务权限
                        if (identityId) {
                            let currentOperatorPermissions = await this.getCurrentOperatorPermission();
                            let permissionList = currentOperatorPermissions.map(item => {
                                return item;
                            })
                            //判断当前用户是不是只有查看权限
                            this.notHasModify = this.hasModifyPermission(permissionList);
                            this.hasCreateOperatorPermission = this.isHasCreateOperatorPermission(this.operaorPermissionResources);
                            if (!this.isFilterPersonBasedOnOrg) {
                                this.queryRootOrganizationList();
                            } else {
                                let superPermissionName = this.configList["PersonManagement_ManagePersonSuperPermission"] || "";
                                if (permissionList.indexOf(superPermissionName) > -1) {
                                    this.managePersonSuperPermissionFlag = true;
                                    this.queryRootOrganizationList();
                                } else {
                                    let currentOperatorOrg = sessionStorage.getItem("currentOrganizationData");
                                    if (currentOperatorOrg) {
                                        this.currentOperatorOrg = JSON.parse(currentOperatorOrg);
                                    } else {
                                        let currentOperator = await this.getCurrentOperator();
                                        if (currentOperator.length && (currentOperator[0]['organizations'] || []).length) {
                                            this.currentOperatorOrg = currentOperator[0]['organizations'].map(item => {
                                                return item.organization;
                                            })
                                        }
                                    }
                                    if (!this.currentOperatorOrg.length) {
                                        this.isDisabled = true
                                    } else {
                                        //查询操作员所有的组织
                                        this.queryOperatorOrganition()
                                    }
                                }
                            }
                        } else {
                            this.queryRootOrganizationList();
                        }
                        if (this.currentOperatorOrg.length) {
                            this.queryPersonParam['condition']['organizationParentId'] = {
                                valueList: this.currentOperatorOrg,
                                operator: "in"
                            }
                        }
                        //this.queryPerson();
                    },
                    selectImage() {
                        if (this.isHasimg) {
                            this.$alert(this.lang.numberExceededMaxNumber, this.lang.error, {
                                type: "error",
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                        }
                    },
                    deleteImageFromObjectStorage(imageUrls) {
                        let param = {
                            imageUrl: imageUrls
                        }
                        this.callConn("/SmartCampus__PersonManagement/1.0.0/deleteImageFromObjectStorage", param, "POST", (res) => { });
                    },
                    discardPerson(id, type) {
                        if (type === "UNKNOWN") {
                            this.$alert(this.lang.unknownTypeNotDiscardMessage, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return
                        }
                        this.$confirm(this.lang.discardConfirmationMessage, this.lang.prompt, {
                            confirmButtonText: this.lang.oK,
                            cancelButtonText: this.lang.cancel,
                            type: 'warning',
                            customClass: 'hw-messagebox',
                        }).then(() => {
                            let param = {
                                idList: [id]
                            }
                            let personArr = this.personList;
                            this.callConn("/SmartCampus__PersonManagement/1.0.0/discardPerson", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    let index = personArr.findIndex(value => value.id === id);
                                    personArr[index].status = "DISABLED";
                                    personArr[index]['isDiscard'] = this.lang.isDiscarded;
                                    Object.assign(this.personList, personArr);
                                    this.$alert(this.lang.discardSuccessfullMessage, this.lang.successfull, {
                                        type: "success",
                                        duration: 2000,
                                        confirmButtonText: this.lang.oK,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                }
                            });
                        })
                    },
                    locationTo() {
                        location.href = "/besBaas/baas/abc/foundation/index.html#/SmartCampus__BatchImportPersonFace";
                    },
                    importPerson() {
                        thisObj.triggerEvent("openModel", {
                            "doOpen": true
                        });
                    },
                    getBytes(str) {
                        var totalLength = 0;
                        var charCode;
                        if (!str) {
                            return totalLength;
                        }
                        for (var i = 0; i < str.length; i++) {
                            charCode = str.charCodeAt(i);
                            if (charCode < 0x007f) {
                                totalLength++;
                            } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
                                totalLength += 2;
                            } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
                                totalLength += 3;
                            } else {
                                totalLength += 4;
                            }
                        }
                        return totalLength;
                    },
                    async queryRootOrganizationList() {
                        console.log("??????????????")
                        let orgRoot = await this.queryRootOrganization();
                        if (orgRoot.length) {
                            orgRoot.forEach(item => {
                                if (item.organizationId) {
                                    let organizationObj = {
                                        id: item.organizationId,
                                        organizationName: item.code
                                    }
                                    this.organizationRootList.push(organizationObj);
                                }
                            })
                        }
                        this.getAllOrganization(this.organizationRootList);
                    },
                    async getAllOrganization(organizationRootList) {
                        for (let i = 0, len = organizationRootList.length; i < len; i++) {
                            let orgObj = await this.queryOrganizationTree(organizationRootList[i].id, false);
                            if (orgObj && orgObj.id) {
                                if (orgObj.children.length == 0) {
                                    delete orgObj.children
                                } else {
                                    this.getChild(orgObj.children);
                                }
                                let orgChildIns = this.getChildOrg(orgObj);
                                if (orgChildIns.length) {
                                    orgChildIns.forEach(item => {
                                        this.orgInsObj[item.id] = item
                                    })
                                }
                                this.organizations.push(orgObj);
                            }
                        }
                    },
                    async queryOperatorOrganition() {
                        let currentOperatorOrgIds = [];
                        let orgIns = [];
                        for (let i = 0, len = this.currentOperatorOrg.length; i < len; i++) {
                            let organization = await this.queryOrganizationTree(this.currentOperatorOrg[i], false);
                            let orgChildIns = this.getChildOrg(organization);
                            if (orgChildIns.length) {
                                orgChildIns.forEach(item => {
                                    this.orgInsObj[item.id] = item
                                })
                            }
                            this.currentOperatorOrgTree.push(organization);

                            this.organizations.push(organization);
                            let organizationObj = {
                                id: organization.id,
                                organizationName: organization.organizationName
                            }
                            orgIns.push(organizationObj);
                            let organizationIds = this.getChildrenId(organization);
                            currentOperatorOrgIds.push(...organizationIds);
                            currentOperatorOrgIds = Array.from(new Set(currentOperatorOrgIds));
                        }
                        this.organizationRootList = orgIns;
                        this.currentOperatorOrgIds = currentOperatorOrgIds
                    },
                    validateLicensePlateNumber(value) {
                        var patrn = /[<>"'%()&+\\/]/;
                        if (patrn.test(value)) {
                            this.$alert(this.lang.valiteVehicleNumber, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return false;
                        }
                        return true;
                    },
                    validateLicensePlateNumberLength(value) {
                        if (unescape(encodeURIComponent(value)).length > 255) {
                            this.$alert(this.lang.vehicleNumberMaxChar, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return false;
                        }
                        return true;
                    },
                    queryOrganizationByOrgid(ids) {
                        let param = {
                            start: 0,
                            limit: 5000,
                            condition: {
                                id: {
                                    valueList: ids,
                                    operator: "in"
                                }
                            }
                        }
                        return new Promise(resolve => {
                            this.callConn("/Organization/0.1.0/Organization/query", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    resolve(res.data[0].organizations);
                                }
                            });
                        })
                    },
                    portalUserRemoteMethod(userName) {
                        const param = {
                            start: 0,
                            limit: 5000,
                            condition: {

                            }
                        }
                        if (userName) {
                            param.condition = {
                                loginAccounts: {
                                    value: userName,
                                    operator: "like"
                                },
                                status: {
                                    value: "Active",
                                    operator: "="
                                },
                                isReturnRole: false,
                                isReturnOrganization: false
                            }
                        } else {
                            param.condition = {}
                        }
                        this.callConn("/SmartCampus__SystemManagement/1.0.0/queryOperator", param, "POST", (res) => {
                            let options = [];
                            if (res.resp.code == '0') {
                                let operators = res.data[0].operators || [];
                                operators.forEach(operator => {
                                    if (operator.loginAccounts) {
                                        operator.loginAccounts.forEach(account => {
                                            if (account.loginAccountType === "EmployeeNo") {
                                                options.push({
                                                    "value": operator.portalUserId,
                                                    "label": account.loginAccount
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            (this.personAttrList || []).forEach(item => {
                                if (item.code === 'portalUser') {
                                    item.options = options;
                                }
                            });

                        })
                    },
                    //删除人员
                    deletePerson(id, type) {
                        if (type === "UNKNOWN") {
                            this.$alert(this.lang.unknownTypeNotDeleteMessage, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return
                        }
                        this.$confirm(this.lang.deletePersonConfirmationMessage, this.lang.prompt, {
                            confirmButtonText: this.lang.oK,
                            cancelButtonText: this.lang.cancel,
                            type: 'warning',
                            customClass: 'hw-messagebox',
                        }).then(() => {
                            let param = {
                                ids: [id]
                            }
                            this.callConn("/SmartCampus__PersonManagement/1.0.0/deletePerson", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    let index = this.personList.findIndex(value => value.id === id);
                                    let params = {
                                        start: (this.currentPage + 1) * this.pageSize,
                                        limit: 1,
                                        condition: this.queryPersonParam.condition
                                    }
                                    this.queryPersonBycondition(params).then(data => {
                                        this.personList.splice(index, 1);
                                        let list = this.personList;
                                        if (data.length) {
                                            data.forEach(item => {
                                                if (item.personBase.gender) {
                                                    switch (item.personBase.gender) {
                                                        case "MALE":
                                                            item.personBase.gender = this.lang.male;
                                                            break;
                                                        case "FEMALE":
                                                            item.personBase.gender = this.lang.female;
                                                            break;
                                                        case "UNKNOWN":
                                                            item.personBase.gender = this.lang.unknown;
                                                    }
                                                }
                                                if (item.personAttachment && (item.personAttachment || []).length > 0) {
                                                    for (let i = 0; i < item.personAttachment.length; i++) {
                                                        if (item.personAttachment[i].attachmentType === 'PICTURE') {
                                                            item.profilePhoto = item.personAttachment[i].url ? item.personAttachment[i].url : item.personAttachment[i].content ? "data:image;base64," + item.personAttachment[i].content : null;
                                                        }
                                                    }
                                                }
                                                item['isHideHeadPortrait'] = true;
                                                if (item.status == 'DISABLED') {
                                                    item['isDiscard'] = this.lang.isDiscarded
                                                } else {
                                                    item['isDiscard'] = "";
                                                }
                                            })
                                            list.push(data[0]);
                                        }

                                        this.personList = list;
                                        this.personTotalSize = this.personTotalSize - 1;
                                        this.$alert(this.lang.deletedSuccessfullMessage, this.lang.successfull, {
                                            type: "success",
                                            duration: 2000,
                                            confirmButtonText: this.lang.oK,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                        setTimeout(() => {
                                            $('.hw-messagebox').find(".el-button").click();
                                        }, 2000)
                                    });

                                }
                            });
                        });

                    },
                    batchDeletePerson() {
                        if (!this.checkedPerson.length) {
                            this.$alert(this.lang.selectPersonInfoMessage, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return;
                        }
                        let hasUnknownPerson = this.isHasUnknownPerson(this.checkedPerson, this.lang.unknownTypeNotDeleteMessage);
                        if (hasUnknownPerson) {
                            return;
                        }
                        this.$confirm(this.lang.deletePersonConfirmationMessage, this.lang.prompt, {
                            confirmButtonText: this.lang.oK,
                            cancelButtonText: this.lang.cancel,
                            type: 'warning',
                            customClass: 'hw-messagebox',
                        }).then(() => {
                            let deleteparam = {
                                ids: this.checkedPerson
                            }
                            this.callConn("/SmartCampus__PersonManagement/1.0.0/deletePerson", deleteparam, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    let param = {
                                        start: (this.currentPage + 1) * this.pageSize,
                                        limit: this.checkedPerson.length,
                                        condition: this.queryPersonParam.condition
                                    }
                                    this.queryPersonBycondition(param).then(data => {
                                        this.checkedPerson.forEach(item => {
                                            let index = this.personList.findIndex(value => value.id === item);
                                            this.personList.splice(index, 1);
                                        })
                                        let list = this.personList;
                                        if (data.length) {
                                            data.forEach(item => {
                                                if (item.personBase.gender) {
                                                    switch (item.personBase.gender) {
                                                        case "MALE":
                                                            item.personBase.gender = this.lang.male;
                                                            break;
                                                        case "FEMALE":
                                                            item.personBase.gender = this.lang.female;
                                                            break;
                                                        case "UNKNOWN":
                                                            item.personBase.gender = this.lang.unknown;
                                                            break;
                                                    }
                                                }
                                                if (item.personAttachment && (item.personAttachment || []).length > 0) {
                                                    for (let i = 0; i < item.personAttachment.length; i++) {
                                                        if (item.personAttachment[i].attachmentType === 'PICTURE') {
                                                            item.profilePhoto = item.personAttachment[i].url ? item.personAttachment[i].url : item.personAttachment[i].content ? "data:image;base64," + item.personAttachment[i].content : null;
                                                        }
                                                    }
                                                }
                                                item['isHideHeadPortrait'] = true;
                                                item['checked'] = false;
                                                if (item.status == 'DISABLED') {
                                                    item['isDiscard'] = this.lang.isDiscarded
                                                } else {
                                                    item['isDiscard'] = "";
                                                }
                                                list.push(item);
                                            })
                                        }
                                        this.personList = list;
                                        this.personTotalSize = this.personTotalSize - this.checkedPerson.length;
                                        this.checkedPerson = [];

                                        this.$alert(this.lang.deletedSuccessfullMessage, this.lang.successfull, {
                                            type: "success",
                                            duration: 2000,
                                            confirmButtonText: this.lang.oK,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                        setTimeout(() => {
                                            $('.hw-messagebox').find(".el-button").click();
                                        }, 2000)
                                    });
                                }
                            });
                        })
                    },
                    isHasUnknownPerson(ids, error) {
                        let personObjList = {};
                        this.personList.forEach(item => {
                            if (!personObjList[item.id]) {
                                personObjList[item.id] = item;
                            }
                        })
                        let isHasUnknowPerson = false;
                        for (let i = 0; i < ids.length; i++) {
                            let personIns = personObjList[ids[i]];
                            if (personIns.personBase.personType[0].code === "UNKNOWN") {
                                isHasUnknowPerson = true;
                                break;
                            }
                        }
                        if (isHasUnknowPerson) {
                            this.$alert(error, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return true
                        }
                        return false;
                    },
                    loadData(node, resolve) {
                        if (!Array.isArray(node.data)) {
                            this.queryOrganizationTree(node.data.id, true).then((data) => {
                                data.children.forEach(item => {
                                    item['leaf'] = !item.hasChildren;
                                })
                                resolve(data.children);
                            })
                        }
                    },
                    batchDiscardPerson() {
                        if (!this.checkedPerson.length) {
                            this.$alert(this.lang.selectToDiscardPersonMessage, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return;
                        }
                        let hasUnknownPerson = this.isHasUnknownPerson(this.checkedPerson, this.lang.unknownTypeNotDiscardMessage);
                        if (hasUnknownPerson) {
                            return;
                        }
                        this.$confirm(this.lang.discardConfirmationMessage, this.lang.prompt, {
                            confirmButtonText: this.lang.oK,
                            cancelButtonText: this.lang.cancel,
                            type: 'warning',
                            customClass: 'hw-messagebox',
                        }).then(() => {
                            let param = {
                                idList: this.checkedPerson
                            }
                            let personArr = this.personList;
                            this.callConn("/SmartCampus__PersonManagement/1.0.0/discardPerson", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    this.checkedPerson.forEach(item => {
                                        let index = personArr.findIndex(value => value.id === item);
                                        personArr[index].status = "DISABLED";
                                        personArr[index]['isDiscard'] = this.lang.isDiscarded
                                        personArr[index]['checked'] = false

                                    })

                                    Object.assign(this.personList, personArr);
                                    this.$alert(this.lang.discardSuccessfullMessage, this.lang.successfull, {
                                        type: "success",
                                        duration: 2000,
                                        confirmButtonText: this.lang.oK,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                    this.checkedPerson = [];
                                }
                            });
                        })
                    },
                    batchExportPerson() {
                        let param = {
                            start: 0,
                            limit: 0,
                            condition: this.queryPersonParam.condition
                        };
                        if (this.personTotalSize === 0) {
                            this.$alert(this.lang.exportPersonsErrorMessage, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return
                        }
                        this.exportPerson(param)
                    },
                    exportPerson(param) {
                        this.callConn("/SmartCampus__PersonManagement/1.0.0/batchExportPersonData", param, "POST", (res) => {
                            if (res.resp.code == '0') {
                                this.$alert(this.lang.exportPersonsSuccessMessage, this.lang.successfull, {
                                    type: "success",
                                    duration: 2000,
                                    confirmButtonText: this.lang.oK,
                                    customClass: 'hw-messagebox',
                                    callback: () => { }
                                });
                                setTimeout(() => {
                                    $('.hw-messagebox').find(".el-button").click();
                                }, 2000)
                            }
                        });

                    },
                    onBeforeUpload(file) {
                        var testmsg = file.name.substring(file.name.lastIndexOf(".") + 1);
                        const extension =
                            testmsg === "jpg" ||
                            testmsg === "JPG" ||
                            testmsg === "jpeg" ||
                            testmsg === "JPEG" ||
                            testmsg === "png" ||
                            testmsg === "PNG" ||
                            testmsg === "bmp" ||
                            testmsg === "BMP";
                        const isLt50M = file.size / 1024 < 2048;
                        if (!extension) {
                            this.$alert(this.lang.fileFormat, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return false; //必须加上return false; 才能阻止
                        }
                        if (!isLt50M) {
                            this.$alert(this.lang.fileSizeExceeds, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return false;
                        }
                        return true;
                    },
                    async uploadFaceImage(file) {
                        let result = this.onBeforeUpload(file.file);
                        if (!result) {
                            file.onError();
                            return;
                        }
                        if (this.uploadFileList.length) {
                            this.$alert(this.lang.numberExceededMaxNumber, this.lang.error, {
                                type: "error",
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            return;
                        }
                        HttpUtils.getCsrfToken(token => {
                            let fileNameList = file.file.name.split('.') || [];
                            let imageType = fileNameList.length ? fileNameList[fileNameList.length - 1] : '';
                            // let reg = imageType ? new RegExp('.' + imageType, 'g') : '';
                            let timeOut = new Date().getTime();
                            let roundom = Math.round(Math.random() * 100);
                            let fileName = timeOut + roundom + '.' + imageType;
                            var object = "uistudio/upload/" + fileName;
                            var url = '/u-route/baas/sys/v1.1/connectors/objectstorageproxy/' + this.configList["SmartCampus__PersonStorageProxyCode"] + '/putobject?object=' + object + '&acl=private';
                            var fr = new FileReader(); //FileReader对象  
                            fr.onload = function (event) {
                                xhr.send(event.target.result);
                            };
                            fr.readAsArrayBuffer(file.file);
                            var xhr = new XMLHttpRequest();
                            xhr.open('post', url);
                            xhr.setRequestHeader('csrf-token', token);
                            xhr.onreadystatechange = async () => {
                                //请求过程完毕
                                if (xhr.readyState === 4 && xhr.status == 200) {
                                    if (JSON.parse(xhr.response).resCode === 0 || JSON.parse(xhr.response).resCode === "0") {
                                        if (JSON.parse(xhr.response).result) {
                                            file.file.originalLink = JSON.parse(xhr.response).result.object;
                                            file.file.url = this.objectProxy + JSON.parse(xhr.response).result.object;
                                            //
                                            this.handleSuccess(file.file)

                                        }
                                    } else {
                                        let response = JSON.parse(xhr.response);
                                        this.$alert(response.resMsg, this.lang.error, {
                                            type: "error",
                                            duration: 2000,
                                            confirmButtonText: this.lang.oK,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                        setTimeout(() => {
                                            $('.hw-messagebox').find(".el-button").click();
                                        }, 2000)
                                    }
                                } else if (xhr.readyState === 4 && xhr.status == 400) {
                                    let response = JSON.parse(xhr.response);
                                    this.$alert(response.resMsg, this.lang.error, {
                                        type: "error",
                                        duration: 2000,
                                        confirmButtonText: this.lang.oK,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                }
                            };
                        })

                    },

                    getChild(space) {
                        for (var i = 0; i < space.length; i++) {
                            if (space[i].children.length == 0) {
                                delete space[i].children;
                            } else {
                                this.getChild(space[i].children);
                            }
                        }
                    },
                    handleChange(checked, id) {
                        if (checked) {
                            this.checkedPerson.push(id);
                        } else {
                            let index = this.checkedPerson.indexOf(id);
                            this.checkedPerson.splice(index, 1)
                        }
                    },
                    async handleSuccess(file) {
                        this.uploadFileList.push({
                            id: file.uid,
                            originalLink: file.originalLink,
                            url: file.url
                        })
                        this.faceImageUrl = [file.url]
                        this.pickList = [];
                        let host = location.origin;
                        let pictureList = this.uploadFileList;
                        if (pictureList && pictureList.length) {
                            pictureList.forEach(item => {
                                let url = item.url;
                                if (url && url.indexOf('https://') === -1 && url.indexOf('http://') === -1) {
                                    url = host + url;
                                }
                                if (url && url.indexOf('viewshareobject') === -1) {
                                    url = host + "/u-route/baas/sys/v1.1/objectstorage/viewshareobject?object=" + item.originalLink;
                                }
                                if (url && url.indexOf('&shareToken=') === -1) {
                                    url = url + "&shareToken=" + "";
                                }
                                if (url && url.indexOf('&StorageProxy=') === -1 && this.configList["SmartCampus__PersonStorageProxyCode"]) {
                                    url = url + "&StorageProxy=" + this.configList["SmartCampus__PersonStorageProxyCode"]
                                }
                                this.pickList.push({
                                    id: item.id,
                                    url: url
                                });
                            });
                        }
                        let urlParam = {
                            transferUrl: this.pickList
                        }
                        let converUrl = await this.refreshFaceUrl(urlParam);
                        if (pictureList && pictureList.length) {
                            pictureList.forEach(item => {
                                if (converUrl && converUrl.length) {
                                    converUrl.forEach(pictur => {
                                        if (item.id === parseInt(pictur.id, 10)) {
                                            item.url = pictur.url;
                                        }
                                    });
                                }
                            });
                        }
                        this.pictureList = pictureList;
                        let faceDetectionFlag = this.configList["PersonBO_FaceDetectionFlag"] || false;
                        if (faceDetectionFlag) {
                            if (this.pictureList && this.pictureList.length) {
                                let transFormList = await this.transformFaceToBase64(urlParam);
                                pictureList.forEach(item => {
                                    if (transFormList && transFormList.length) {
                                        transFormList.forEach(pictur => {
                                            if (item.id === parseInt(pictur.id, 10)) {
                                                item.content = pictur.imageBase64;
                                            }
                                        });
                                    }
                                });
                                this.dedectFace(this.pictureList)
                            }
                        }
                    },
                    getStorageType(id) {
                        let type = "";
                        return new Promise(resolve => {
                            this.callConn("/SmartCampus__PersonManagement/1.0.0/getStorageType", {
                                id: id
                            }, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    type = res.data[0].connectorType;
                                    resolve(type);

                                }
                            });
                        })
                    },
                    async editPerson(id, isChecked) {
                        this.isModifyPerson = true;
                        this.isAddPerson = false;
                        this.drawwerTitle = this.lang.modifyPerson;
                        this.isChecked = isChecked;
                        if (isChecked) {
                            this.disabled = true;
                            this.drawwerTitle = this.lang.viewPerson;

                        }
                        let param = {
                            start: 0,
                            limit: 1,
                            condition: {
                                id: {
                                    value: id,
                                    operator: "="
                                }
                            }
                        }
                        let personInfo = await this.querypersonById(param);
                        if (!isChecked) {
                            if (personInfo[0].status == 'DISABLED') {
                                this.$alert(this.lang.isEditDisabledMessage, this.lang.error, {
                                    type: "error",
                                    confirmButtonText: this.lang.oK,
                                    duration: 2000,
                                    customClass: 'hw-messagebox',
                                    callback: () => { }
                                });
                                setTimeout(() => {
                                    $('.hw-messagebox').find(".el-button").click();
                                }, 2000)
                                return;
                            }
                        }

                        this.showPersonInfoDrawer = true;
                        if (isChecked) {
                            setTimeout(() => {
                                this.$refs['personForm'].clearValidate();
                            })

                        }
                        let pictureList = [];
                        var host = window.location.origin;

                        (personInfo[0].personAttachment || []).forEach((r) => {
                            var url = r.url ? r.url : r.content ? "data:image;base64," + r.content : "";
                            pictureList.push({
                                //图片上传路径URL
                                url: url,
                                // 图片显示路径URL
                                id: r.id
                            });
                        });
                        let covertUrl = [];
                        if (pictureList.length) {
                            let urlParam = {
                                transferUrl: pictureList
                            }
                            covertUrl = await this.refreshFaceUrl(urlParam);
                        }
                        var picList = [];
                        (personInfo[0].personAttachment || []).forEach((r) => {
                            var url = r.url ? r.url : r.content ? r.content : "";
                            var urlName = "";
                            if (url) {
                                if (r.url) {
                                    if (r.url.indexOf("&access-token") >= 0) {
                                        urlName = r.url.split("&access-token")[0];
                                    } else if (r.url.indexOf("&shareToken") >= 0) {
                                        urlName = r.url.split("&shareToken")[0];
                                    } else {
                                        urlName = url;
                                    }
                                }

                                let minioPrefix = this.configList["SmartCampus__PersonMinioPrefix"] || '';
                                if (covertUrl && covertUrl.length) {
                                    covertUrl.forEach(function (item) {
                                        if (r.id === item.id) {
                                            if (item.url.indexOf("https://") === -1 && item.url.indexOf("http://") === -1) {
                                                // minioPrefix存在表示私有云，不存在表示公有云
                                                if (minioPrefix) {
                                                    url = minioPrefix + item.url
                                                } else if (item.url.indexOf('data:image') > -1) {
                                                    url = item.url
                                                } else {
                                                    url = host + item.url
                                                }
                                            } else {
                                                url = item.url
                                            }
                                        }
                                    });
                                }
                            }
                            picList.push({
                                name: urlName ? urlName : new Date().toISOString() + '.png',
                                originalUrl: url,
                                //图片上传路径URL
                                url: url,
                                // 图片显示路径URL
                                id: r.id,
                                imageId: r.name
                            });
                        });
                        this.beforePersonIdentity = personInfo[0].personIdentity;
                        (personInfo[0].personIdentity || []).forEach(function (r) {
                            if ((r.identityType == 'Face' || r.identityType == 'FACE') && r.proofValue) {
                                r.action = 'DEL';
                            }
                        });
                        picList.forEach(item => {
                            var isSelected = false;
                            personInfo[0].personIdentity.forEach(identity => {
                                if (identity.identityType === 'FACE' && identity.proofValue === item.id) {
                                    isSelected = true;
                                }
                            })
                            item['isSelected'] = isSelected;
                        })
                        var temp = picList || [];

                        var pic = [];
                        temp.forEach(function (item) {
                            pic.push({
                                attachmentType: 'PICTURE',
                                url: item.url,
                                id: item.id,
                                name: item.imageId
                            });
                        });
                        this.beforeAttchment = pic;
                        var identityList = [];
                        (personInfo[0].personIdentity || []).forEach(function (identity) {
                            if (identity.identityType != 'Face' && identity.identityType != 'FACE') {
                                identityList.push(identity);
                            }
                        });
                        if (identityList.length > 0) {
                            for (var i = 0; i < identityList.length; i++) {
                                if (identityList[i]["identityType"] === "ID_CARD") {
                                    this.isHaveIdentity = true;
                                    this.proofValue = identityList[i].proofValue.slice(0, 6) + "************";
                                    break;
                                }
                            }
                        }

                        this.uploadFileList = picList;
                        setTimeout(() => {
                            if (this.$refs["faceUpload"] && this.$refs["faceUpload"]["fileList"]) {
                                this.$refs["faceUpload"]["fileList"] = picList.slice();
                            }
                            this.isPicSelect = picList[0] ? picList[0].isSelected : false;

                        })
                        let personAttrObj = {}
                        if (personInfo[0].personAttr) {
                            personInfo[0].personAttr.forEach(item => {
                                personAttrObj[item.attrDef.code] = item
                            })
                        }
                        Object.keys(personAttrObj).forEach(item => {
                            this.personAttr.push({
                                attributeCode: personAttrObj[item].attrDef.code,
                                attributeValue: personAttrObj[item].attrValue
                            })
                        })
                        let portalUserId = "";
                        let operatorParams = {};
                        if (this.personAttr) {
                            this.personAttr.forEach((item, index) => {
                                if (item.attributeCode === "portalUser") {
                                    portalUserId = item.attributeValue;
                                    this.portalUserId = item.attributeValue
                                    operatorParams = {
                                        portaluserId: {
                                            value: portalUserId
                                        },
                                        status: {
                                            value: "Active"
                                        },
                                        isReturnRole: false,
                                        isReturnPortalUserId: false
                                    };
                                }
                            });
                        }
                        if (portalUserId) {
                            this.portalUserInfo = await this.queryIdenTity(operatorParams);
                            this.createOperatorFlagDiasabled = true;
                            this.showCreatOperatorBut = false;
                        } else {
                            this.createOperatorFlagDiasabled = false;
                            this.showCreatOperatorBut = true;
                        }
                        this.queryPersonDefinition(personInfo[0].personBase.personType[0].code);
                        let personGroup = personInfo[0].personGroup.map(function (g) {
                            return g.id;
                        })
                        let vehicles = (personInfo[0].personVehicle || []).map(function (r) {
                            if (!r.vehicleDesc) {
                                r.vehicleDesc = " ";
                            }
                            return r;
                        })
                        this.beforeVehicles = vehicles.slice();
                        this.personInfoForm = {
                            "id": id,
                            "personPictures": [],
                            "person": {
                                "typeCode": this.getTrueValue(personInfo[0].personBase.personType, 'code'),
                                "personName": personInfo[0].personBase.personName,
                                "personNameEn": personInfo[0].personBase.personNameEn || (isChecked && !personInfo[0].personBase.personNameEn ? " " : null),
                                "gender": personInfo[0].personBase.gender,
                                "status": personInfo[0].status,
                                "dateOfBirth": personInfo[0].personBase.dateOfBirth || (isChecked && !personInfo[0].personBase.dateOfBirth ? " " : null),
                                "personGroup": personGroup
                            },
                            "operatorInfo": {
                                "createOperatorFlag": false,
                                "password": ''
                            },
                            "personLocation": {},
                            "personVehicle": JSON.parse(JSON.stringify(vehicles.slice())),
                            "personOrganization": [],
                            "personIdentity": identityList,
                            "personAttribute": []
                        }
                        const orgIds = personInfo[0].personOrganization.map(item => {
                            return item.organization;
                        })
                        this.initOrganizationIds = [];
                        this.initOrganization = [];
                        if (orgIds.length) {
                            this.queryOrganizationByOrgid(orgIds).then(data => {
                                let orgObj = {};
                                data.forEach(item => {
                                    if (!orgObj[item.id]) {
                                        orgObj[item.id] = item
                                    }
                                })
                                let orgList = [];
                                //
                                personInfo[0].personOrganization.forEach(item => {
                                    orgList.push({
                                        id: item.id,
                                        organizationId: orgObj[item.organization].id,
                                        organizationCode: orgObj[item.organization].code,
                                        organizationDesc: orgObj[item.organization].description,

                                    })
                                })
                                this.personInfoForm.personOrganization = JSON.parse(JSON.stringify(orgList));
                                this.initOrganizationIds = orgList.map(item => {
                                    return item.organizationId;
                                })
                                this.initOrganization = orgList.map(item => {
                                    return item;
                                })
                            })
                        }
                        this.personInfoForm.personPictures = picList;
                        if (!isChecked) {
                            if (identityList.length) {
                                var identityIds = [];
                                identityList.forEach(function (item) {
                                    if (item.proofValue.indexOf("**") !== -1) {
                                        identityIds.push(item.id);
                                    }
                                });
                                if (identityIds.length) {
                                    var queryIdentityparam = {
                                        start: 0,
                                        limit: 5000,
                                        condition: {
                                            id: {
                                                valueList: identityIds,
                                                operator: "in"
                                            }
                                        }
                                    };
                                    this.queryPersonIndentity(queryIdentityparam);
                                }
                            }
                        }
                        this.beforePersonInfo = JSON.parse(JSON.stringify(this.personInfoForm));
                    },
                    filterNode(value, data) {
                        if (!value) return true;
                        return data.organizationName.toLowerCase().indexOf(value.toLowerCase()) !== -1;
                    },
                    queryIdenTity(param) {
                        let condition = {
                            start: 0,
                            limit: 1,
                            condition: param
                        }
                        let identities = [];
                        return new Promise(resolve => {
                            this.callConn("/CM_Identity/0.1.0/Identity/query", condition, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    identities = res.data[0].identities;
                                    resolve(identities);
                                }
                            });
                        })
                    },
                    getTrueValue(array, attr) {
                        if (array && array.length) {
                            return array[0][attr];
                        }
                        return "";
                    },
                    queryPersonIndentity(param) {
                        this.callConn("/Person/0.1.0/PersonIdentity/query", param, "POST", (res) => {
                            if (res.resp.code == '0' && res.data[0].identityRecord.length) {
                                if (this.personInfoForm.personIdentity.length) {
                                    this.personInfoForm.personIdentity.forEach(function (newItem) {
                                        if (newItem.proofValue.indexOf("**") !== -1) {
                                            res.data[0].identityRecord.forEach(function (identity) {
                                                if (newItem.identityType === identity.identityType) {
                                                    newItem.proofValue = identity.proofValue;
                                                }
                                            });
                                        }
                                    });
                                    this.beforePersonInfo = JSON.parse(JSON.stringify(this.personInfoForm));
                                }
                            }
                        });
                    },
                    fileterIdentityType(value) {
                        this.typeList = this.identityTypeList.slice();
                        if (value) {
                            if (this.personInfoForm.personIdentity.length) {
                                this.personInfoForm.personIdentity.forEach(item => {
                                    let index = this.typeList.findIndex(identity => identity.value === item.identityType);
                                    if (index > -1) {
                                        this.typeList.splice(index, 1);
                                    }
                                })
                            }

                        }
                    },
                    async dedectFace(picList) {
                        if (picList && picList.length) {
                            for (let i = 0; i < picList.length; i++) {
                                let pictureItem = picList[i];
                                let imageBase64 = "";
                                let imageURL = "";
                                let blackImage = false;
                                if (pictureItem.url.indexOf("https://") === -1 && pictureItem.url.indexOf("http://") === -1 && pictureItem.url.indexOf('image;base64,') === -1) {
                                    let host = location.origin;
                                    imageURL = host + pictureItem.url;
                                } else if (pictureItem.url.indexOf('data:image;base64,') !== -1) {
                                    let reg = /(data:image;base64,)/;
                                    imageBase64 = pictureItem.url.replace(reg, '');
                                } else {
                                    imageURL = pictureItem.url;
                                }
                                if (pictureItem.content) {
                                    imageURL = "";
                                    imageBase64 = pictureItem.content;
                                }
                                pictureItem.isSelected = false;
                                if (imageURL) {
                                    if (imageURL.indexOf("/uistudio") == 0) {
                                        blackImage = true;
                                    }
                                }
                                if (blackImage) {
                                    this.$alert(this.lang.blackListPhoto, '警告', {
                                        type: "warning",
                                        confirmButtonText: this.lang.oK,
                                        duration: 2000,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                }

                                let param = {
                                    imageUrl: imageURL,
                                    imageBase64: imageBase64,
                                    IsReturnCharacter: false,
                                    IsReturnLandmark: false
                                }
                                let detectFaceRes = await this.doDetectFace(param);
                                let errMessage;
                                let resCode;
                                if (detectFaceRes && detectFaceRes.resCode && detectFaceRes.resMsg) {
                                    errMessage = detectFaceRes.resMsg;
                                    resCode = detectFaceRes.resCode;
                                    this.syncEIFlag = [];
                                    this.cbDisabled = false;
                                    pictureItem.isSelected = false;

                                } else if (detectFaceRes && detectFaceRes.data[0] && !detectFaceRes.data[0].hasFace) {
                                    errMessage = this.lang.invarlidFace;
                                    resCode = detectFaceRes.resCode;
                                    this.syncEIFlag = [];
                                    this.cbDisabled = false;
                                    pictureItem.isSelected = false;

                                } else {
                                    this.cbDisabled = false;
                                    resCode = 0;
                                }
                                if (resCode === 0) {
                                    pictureItem.isSelected = true;
                                    this.$alert(this.lang.faceDetectedSuccess, this.lang.successfull, {
                                        type: "success",
                                        confirmButtonText: this.lang.oK,
                                        duration: 2000,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                } else {
                                    this.$alert(errMessage, this.lang.error, {
                                        type: "error",
                                        confirmButtonText: this.lang.oK,
                                        duration: 2000,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                }
                            }
                            Object.assign(this.$refs['faceUpload'].uploadFiles[0], {
                                isSelected: picList[0].isSelected
                            });
                            $(".el-upload-list__item").focus();
                        }

                    },
                    doDetectFace(param) {
                        return new Promise(resolve => {
                            this.callConn("/Person/0.1.0/Face/detect", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    resolve(res);
                                }
                            });
                        })
                    },
                    cascaderNodeAddTitle() { // el-cascader组件中手动给鼠标滑过行元素时增加一个title属性
                        setTimeout(function () {
                            $('.el-cascader-node__label').mouseover(function () {
                                $(this)[0].title = $(this)[0].innerText;
                            });
                        }, 500);
                    },
                    loading(flag) {
                        if (flag) {
                            let loadingAnimation = `<div class="loading">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                  </div>`;
                            //
                            if ($('.tree-wrapper')) {
                                $('.tree-wrapper').eq(0).append(loadingAnimation);
                            }
                        } else {
                            if ($('.loading')) {
                                $('.loading').remove();
                            }
                        }
                    },
                    async showFacePicture(data) {
                        let pictureList = [];
                        const minioPrefix = this.configList["SmartCampus__PersonMinioPrefix"] || '';
                        if (data.profilePhoto && data.isHideHeadPortrait) {
                            let param = {
                                start: 0,
                                limit: 1,
                                condition: {
                                    id: {
                                        value: data.id,
                                        operator: "="
                                    }
                                }
                            }
                            let personInst = await this.querypersonById(param);
                            if (personInst && personInst.length) {
                                if (personInst[0].personAttachment && personInst[0].personAttachment.length) {
                                    personInst[0].personAttachment.forEach(item => {
                                        pictureList.push({
                                            //图片上传路径URL
                                            url: item.url,
                                            // 图片显示路径URL
                                            id: personInst[0].id
                                        });
                                    });
                                }
                            }
                            if (pictureList.length) {
                                let urlParam = {
                                    transferUrl: pictureList
                                }
                                let covertUrl = await this.refreshFaceUrl(urlParam);
                                if (covertUrl && covertUrl.length) {
                                    covertUrl.forEach(function (item) {
                                        if (data.id === item.id) {
                                            if (item.url.indexOf("https://") === -1 && item.url.indexOf("http://") === -1) {
                                                // minioPrefix存在表示私有云，不存在表示公有云
                                                if (minioPrefix && data.profilePhoto) {
                                                    var reg = /^[\/]+/;
                                                    var reg2 = /[\/]+$/;
                                                    if (reg.test(item.url) && reg2.test(minioPrefix)) {
                                                        data.profilePhoto = minioPrefix + item.url.replace(reg, "");
                                                    } else {
                                                        data.profilePhoto = minioPrefix + item.url;
                                                    }
                                                } else if (item.url.indexOf('data:image') > -1) {
                                                    data.profilePhoto = item.url
                                                } else {
                                                    data.profilePhoto = location.origin + item.url
                                                }
                                            } else {
                                                data.profilePhoto = item.url
                                            }
                                        }
                                    });
                                }
                                data.isHideHeadPortrait = false;
                            }

                        } else {
                            data.isHideHeadPortrait = true;
                        }
                    },
                    getObjectProxy() {
                        let proxy = "";
                        return new Promise(resolve => {
                            this.callConn("/SmartCampus__UnifiedPortal/1.0.0/getObjectStorageProxy", {}, "GET", (res) => {
                                if (res.resp.code == '0') {
                                    proxy = res.data[0].urlPrefix;
                                    resolve(proxy);
                                }
                            });
                        })
                    },
                    queryPersonBycondition(param) {
                        return new Promise(resolve => {
                            // this.callConn("/SmartCampus__PersonManagement/1.0.0/queryPersonsWithCurOrg", param, "POST", (res) => {
                            this.callConn("/hm_bigScreen__HMSecurityManagement/1.0.0/queryPersonsWithCurOrg", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    resolve(res.data[0].persons);
                                }
                            });
                        })
                    },
                    queryPersonGroupList(page) {
                        if (!page) {
                            page = 1;
                        }
                        let inputParam = {
                            "start": (page - 1) * this.groupPageSize,
                            "limit": this.groupPageSize,
                            "condition": {}
                        }
                        if (this.searchGroupKeyword) {
                            inputParam.condition = {
                                groupName: {
                                    value: this.searchGroupKeyword,
                                    operator: 'like'
                                }
                            }
                        }
                        $(".loading").remove();
                        this.loading(true);
                        this.isLoading = false;
                        this.getPersonGroupList(inputParam);
                    },
                    addPerson() {
                        this.personTypeList.forEach((item, index) => {
                            if (!this.configList["PersonManagement_IsCloudVC"] && item.value == 'SECURITY') {
                                this.personTypeList.splice(index, 1);
                            }
                            if (item.value == 'UNKNOWN') {
                                this.personTypeList.splice(index, 1);
                            }
                        })
                        this.addIdentityDisable = true;
                        this.isAddPerson = true;
                        this.isModifyPerson = false;
                        this.showPersonInfoDrawer = true;
                        this.drawwerTitle = this.lang.addPerson;
                        let groupId = this.$refs["groupTree"].getCurrentKey();
                        if (groupId === 1) {
                            groupId = null;
                        }
                        let orgId = this.$refs["orgTree"].getCurrentKey();
                        this.personInfoForm.person.personGroup = [];
                        if (groupId) {
                            this.personInfoForm.person.personGroup.push(groupId);
                        }
                        let org = [];
                        if (orgId) {
                            let orgIns = this.orgInsObj[orgId];
                            org.push({
                                organizationId: orgId,
                                organizationCode: orgIns.code,
                                organizationDesc: orgIns.description,
                            })
                        }
                        this.personInfoForm.personOrganization.push(...org);
                        this.personInfoForm.operatorInfo.createOperatorFlag = false;
                        this.personInfoForm.operatorInfo.password = "";
                    },
                    queryOrganizationTree(orgId, flag) {
                        let organizationTree = {}
                        return new Promise(resolve => {
                            this.callConn("/Organization/0.1.0/queryOrganizationTree/" + orgId + "?isChildren=" + flag, {}, "GET", (res) => {
                                if (res.resp.code == '0') {
                                    organizationTree = res.data[0].organization;
                                    console.log("///////////////////")
                                    resolve(organizationTree);

                                }
                            });
                        })
                    },
                    beforeClose() {
                        if (!this.isChecked) {
                            this.$confirm(this.lang.closeDialog, this.lang.prompt, {
                                confirmButtonText: this.lang.oK,
                                cancelButtonText: this.lang.cancel,
                                type: 'warning',
                                customClass: 'hw-messagebox',
                            }).then(() => {
                                this.showPersonInfoDrawer = false;
                            }).catch(() => {

                            });
                        } else {
                            this.showPersonInfoDrawer = false;
                        }
                    },
                    colseDrawer() {
                        this.showPersonInfoDrawer = false;
                        this.createOperatorFlagDiasabled = false
                        this.$refs['personForm'].resetFields();
                        if (this.faceImageUrl.length) {
                            this.deleteImageFromObjectStorage(this.faceImageUrl);
                        }
                        this.uploadFileList = [];
                        if (this.$refs["faceUpload"] && this.$refs["faceUpload"].fileList) {
                            this.$refs["faceUpload"].fileList = [];
                        }
                        this.personInfoForm = {
                            "personPictures": [],
                            "person": {
                                "typeCode": null,
                                "personName": null,
                                "personNameEn": null,
                                "gender": null,
                                "status": null,
                                "dateOfBirth": null,
                                "personGroup": []
                            },
                            "personLocation": {},
                            "personVehicle": [],
                            "personOrganization": [],
                            "personIdentity": [],
                            "personAttribute": [],
                            "operatorInfo": {
                                "createOperatorFlag": false,
                                "password": null
                            }
                        }
                        this.hideAtribute = false;
                        this.disabled = false;
                        this.personAttr = [];
                        this.addPersonIdentity = true;
                        this.imgUrl = '';
                        this.sendRequest = true;
                        this.portalUserId = '';
                        this.personAttr = [];
                        this.personAttrList = [];
                        this.portalUserInfo = [];
                        this.faceImageUrl = []
                    },
                    setPersonVehicleTrim() {
                        (this.personInfoForm.personVehicle || []).forEach(function (item) {
                            if (item.vehicleDesc) {
                                item.vehicleDesc = item.vehicleDesc.trim()
                            }
                        })
                    },
                    handlePersonData() {
                        if (this.isAddPerson) {
                            if (this.sendRequest) {
                                this.$refs["personForm"].validate((valid) => {
                                    if (valid) {
                                        var personOrganization = (this.personInfoForm.personOrganization || []).map(function (item) {
                                            return {
                                                organization: item.organizationId
                                            }
                                        })
                                        let personPictures = [];
                                        let personAttributes = [];
                                        this.setPersonVehicleTrim();
                                        var param = {
                                            personPictures: personPictures,
                                            personAttribute: personAttributes,
                                            person: {
                                                typeCode: [this.personInfoForm.person.typeCode],
                                                personName: (this.personInfoForm.person.personName || '').trim(),
                                                personNameEn: (this.personInfoForm.person.personNameEn || '').trim(),
                                                gender: this.personInfoForm.person.gender,
                                                status: '',
                                                dateOfBirth: this.personInfoForm.person.dateOfBirth,
                                                personGroup: this.personInfoForm.person.personGroup
                                            },
                                            personLocation: {},
                                            personVehicle: this.personInfoForm.personVehicle,
                                            personOrganization: personOrganization
                                        };

                                        param.personIdentity = this.personInfoForm.personIdentity.map(function (r) {
                                            r.action = 'ADD';
                                            return r;
                                        });
                                        if (this.uploadFileList.length) {
                                            var attachment = {
                                                attachmentType: 'PICTURE',
                                                url: this.uploadFileList[0].url,
                                                content: this.uploadFileList[0].content
                                            };
                                            personPictures.push({
                                                syncEIFlag: this.uploadFileList[0].isSelected,
                                                personAttachment: attachment
                                            });
                                        }
                                        let phone = '';
                                        if (this.personInfoForm.personAttribute.length) {
                                            this.personInfoForm.personAttribute.forEach(function (item) {
                                                if (typeof (item.attributeValue) == 'string') item.attributeValue = item.attributeValue.trim();
                                                if (item.attributeValue) {
                                                    personAttributes.push({
                                                        action: 'ADD',
                                                        attributeCode: item.attributeCode,
                                                        attributeValue: item.attributeValue
                                                    });
                                                }
                                                if (item.attributeCode == 'phone') {
                                                    phone = item.attributeValue
                                                }
                                            });
                                        }
                                        // 弹窗校验
                                        let validateError = false;
                                        // 判断勾选了 创建用户 勾选框
                                        if (this.personInfoForm.operatorInfo && this.personInfoForm.operatorInfo.createOperatorFlag) {
                                            if (this.isConfigPassword) {
                                                this.$refs["operatorPasswordFrom"].validate((validItem) => {
                                                    if (validItem) {
                                                        validateError = false;
                                                    } else {
                                                        validateError = true;
                                                        return false;
                                                    }
                                                });
                                            }
                                            phone = phone.trim();
                                            // 同步创建用户信息
                                            param.operatorInfo = {
                                                createOperatorFlag: true,
                                                loginAccount: (this.personInfoForm.person.personNameEn || '').trim(),
                                                nickName: (this.personInfoForm.person.personName || '').trim(),
                                                phoneNumber: phone,
                                                password: ""
                                            }
                                            if (phone && !validateError) {
                                                // 创建用户校验电话
                                                validateError = this.valiteOperatorPhone(phone);
                                            }
                                        }
                                        // 根据系统参数 SystemManagement_IsConfigPassword 判断是否需要输入密码  true:设置用户密码 是必填 false:使用默认密码
                                        if (this.isConfigPassword && this.personInfoForm.operatorInfo && this.personInfoForm.operatorInfo.createOperatorFlag && this.personInfoForm.operatorInfo.password) {
                                            param.operatorInfo["password"] = this.personInfoForm.operatorInfo.password;
                                        }
                                        if (!validateError) {
                                            validateError = this.valitePersonIdentity(param);
                                        }
                                        if (!validateError) {
                                            validateError = this.valitePersonVehicle(param)
                                        }
                                        if (!validateError) {
                                            this.callConn("/SmartCampus__PersonManagement/1.0.0/addPerson", param, "POST", (res) => {
                                                if (res.resp.code == '0' && res.data[0].id) {
                                                    let personIns = {
                                                        personBase: {
                                                            ...param.person
                                                        }
                                                    };
                                                    if (param.person.gender) {
                                                        switch (param.person.gender) {
                                                            case "MALE":
                                                                personIns.personBase['gender'] = this.lang.male
                                                                break;
                                                            case "FEMALE":
                                                                personIns.personBase['gender'] = this.lang.female
                                                                break;
                                                        }
                                                    }
                                                    if (param.personPictures && (param.personPictures || []).length > 0) {
                                                        for (let i = 0; i < param.personPictures.length; i++) {
                                                            if (param.personPictures[i]["personAttachment"].attachmentType === 'PICTURE') {
                                                                personIns['profilePhoto'] = param.personPictures[i]["personAttachment"].url ? param.personPictures[i]["personAttachment"].url : param.personPictures[i]["personAttachment"].content ? "data:image;base64," + param.personPictures[i]["personAttachment"].content : null;
                                                            }
                                                        }
                                                    }
                                                    personIns['isHideHeadPortrait'] = true;
                                                    personIns['id'] = res.data[0].id;
                                                    for (let i = 0; i < this.personTypeList.length; i++) {
                                                        if (this.personTypeList[i].value === param.person.typeCode[0]) {
                                                            personIns["personBase"]["personType"] = [{
                                                                typeName: this.personTypeList[i].label.split(" ")[0]
                                                            }]
                                                            break;
                                                        }
                                                    }
                                                    if (this.currentPage === 1) {
                                                        this.personList.unshift(personIns);
                                                        if (this.personList.length > this.pageSize) {
                                                            this.personList.splice(this.personList.length - 1, 1);
                                                        }
                                                    }
                                                    this.showPersonInfoDrawer = false;
                                                    this.isAddPerson = false;
                                                    this.personTotalSize = this.personTotalSize + 1;
                                                    this.$alert(this.lang.successContent, this.lang.successfull, {
                                                        type: "success",
                                                        confirmButtonText: this.lang.oK,
                                                        duration: 2000,
                                                        customClass: 'hw-messagebox',
                                                        callback: () => { }
                                                    });
                                                    setTimeout(() => {
                                                        $('.hw-messagebox').find(".el-button").click();
                                                    }, 2000)
                                                    this.sendRequest = true;
                                                } else {
                                                    this.sendRequest = true;
                                                }
                                                this.faceImageUrl = [];
                                            }, (res) => {
                                                this.sendRequest = true;
                                                let resMsg = res.response.resMsg;
                                                let resCode = res.response.resCode;
                                                if (resCode == 'Person.IllegalAttributeValue') {
                                                    resMsg = this.lang.portalUserIsUsed;
                                                }
                                                this.$alert(resMsg, this.lang.error, {
                                                    type: "error",
                                                    confirmButtonText: this.lang.oK,
                                                    duration: 2000,
                                                    customClass: 'hw-messagebox',
                                                    callback: () => { }
                                                });
                                                setTimeout(() => {
                                                    $('.hw-messagebox').find(".el-button").click();
                                                }, 2000)
                                            })
                                        } else {
                                            this.sendRequest = true;
                                            return;
                                        }

                                    } else {
                                        this.sendRequest = true;
                                        //
                                        return false;
                                    }
                                    this.sendRequest = false;
                                });

                            }

                        } else if (this.isModifyPerson) {
                            if (this.sendRequest) {
                                this.$refs["personForm"].validate((valid) => {
                                    if (valid) {
                                        var selectIds = (this.personInfoForm.personOrganization || []).map(function (item) {
                                            return item.organizationId;
                                        })
                                        var addOrganizations = [];
                                        var delOrganizations = [];
                                        if (selectIds && selectIds.length > 0) {
                                            selectIds.forEach((item) => {
                                                if (this.initOrganizationIds.indexOf(item) === -1) {
                                                    var organization = {
                                                        organization: item,
                                                        action: "ADD"
                                                    }
                                                    addOrganizations.push(organization);
                                                }
                                            })
                                        }
                                        if (this.initOrganization && this.initOrganization.length > 0) {
                                            this.initOrganization.forEach(function (item) {
                                                if (selectIds.indexOf(item.organizationId) === -1) {
                                                    var organization = {
                                                        organization: item.organizationId,
                                                        action: "DEL",
                                                        id: item.id
                                                    }
                                                    delOrganizations.push(organization);
                                                } else {
                                                    // 原来新增的组织数据 不是新增和修改 也要传过去
                                                    var organizatioOld = {
                                                        organization: item.organizationId,
                                                        action: "CHG",
                                                        id: item.id
                                                    }
                                                    addOrganizations.push(organizatioOld);
                                                }
                                            })
                                        }
                                        let personOrganization = addOrganizations.concat(delOrganizations);
                                        let pictrueFile = this.uploadFileList || []; //originalUrl
                                        let attachmentType = [];
                                        let personPictures = [];
                                        pictrueFile.forEach((item) => {
                                            if (item && item.url) {
                                                let isSelected = true;
                                                this.addFaceId.push(item.id);
                                                item['attachmentType'] = 'PICTURE';
                                                item['syncEIFlag'] = isSelected;
                                                attachmentType.push(item);
                                                this.imgUrl = item.url;
                                            }
                                        });
                                        this.beforeAttchment.forEach((item) => {
                                            // 删除图片
                                            var isDelet = true;
                                            this.uploadFileList.forEach(function (pictrue) {
                                                if (item.id === pictrue.id) {
                                                    isDelet = false;
                                                }
                                            });

                                            if (isDelet) {
                                                item.action = 'DEL';
                                                personPictures.push({
                                                    syncEIFlag: item.syncEIFlag ? true : false,
                                                    personAttachment: item
                                                });
                                            }
                                        });
                                        attachmentType.forEach((item) => {
                                            var isAdd = true;
                                            this.beforeAttchment.forEach((pictrue) => {
                                                if (item.url && pictrue.url && item.id === pictrue.id) {
                                                    isAdd = false;
                                                }
                                            });

                                            if (isAdd) {
                                                // 添加图片
                                                item.action = 'ADD';
                                                personPictures.push({
                                                    syncEIFlag: item.syncEIFlag,
                                                    personAttachment: {
                                                        action: "ADD",
                                                        url: item.url,
                                                        attachmentType: item.attachmentType
                                                    }
                                                });
                                                this.imgUrl = item.url;
                                            } else if (item.syncEIFlag) {
                                                // 选择人脸识别判断identity中是否已经包含该人脸识别信息
                                                var isChange = true;
                                                (this.beforePersonIdentity || []).forEach(function (identity) {
                                                    if (identity.identityType == "Face" || identity.identityType == "FACE") {
                                                        if (item.id === identity.proofValue) {
                                                            isChange = false;
                                                        }
                                                    }
                                                });

                                                if (isChange) {
                                                    let attchmentName = this.getAttchmentName(item.id)
                                                    let name0 = attchmentName ? attchmentName : item.name;
                                                    name0 = this.substrPictureName(name0);
                                                    personPictures.push({
                                                        syncEIFlag: item.syncEIFlag,
                                                        personAttachment: {
                                                            action: "CHG",
                                                            url: item.url,
                                                            id: item.id,
                                                            name: name0,
                                                            attachmentType: item.attachmentType
                                                        }
                                                    });
                                                    this.imgUrl = item.url;
                                                }
                                            } else {
                                                if (pictrueFile && pictrueFile.length) {
                                                    pictrueFile.forEach((picInfo) => {
                                                        if (picInfo.id === item.id && picInfo.isSelected !== item.syncEIFlag) {
                                                            if (personPictures && personPictures.length) {
                                                                let flag = false;
                                                                personPictures.forEach(picItem => {
                                                                    if (picItem.personAttachment.id === picInfo.id) {
                                                                        flag = true;
                                                                    }
                                                                });
                                                                if (!flag) {
                                                                    let attchmentName = this.getAttchmentName(item.id)
                                                                    let name = attchmentName ? attchmentName : item.name;
                                                                    name = this.substrPictureName(name);
                                                                    personPictures.push({
                                                                        syncEIFlag: item.syncEIFlag,
                                                                        personAttachment: {
                                                                            action: "CHG",
                                                                            url: item.url,
                                                                            id: item.id,
                                                                            name: name,
                                                                            attachmentType: item.attachmentType
                                                                        }
                                                                    });
                                                                    this.imgUrl = item.url;
                                                                }
                                                            } else {
                                                                let attchmentName = this.getAttchmentName(item.id)
                                                                let name1 = attchmentName ? attchmentName : item.name;
                                                                name1 = this.substrPictureName(name1);
                                                                personPictures.push({
                                                                    syncEIFlag: item.syncEIFlag,
                                                                    personAttachment: {
                                                                        action: "CHG",
                                                                        url: item.url,
                                                                        id: item.id,
                                                                        name: name1,
                                                                        attachmentType: item.attachmentType
                                                                    }
                                                                });
                                                                this.imgUrl = item.url;
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        });
                                        var beforeGroupRemeber = this.beforePersonInfo.person.personGroup || [];
                                        var currentGroupRemeber = this.personInfoForm.person.personGroup || [];
                                        var deleteGroup = [];
                                        beforeGroupRemeber.forEach(function (g) {
                                            if (currentGroupRemeber.indexOf(g) < 0) deleteGroup.push({
                                                action: 'DEL',
                                                groupId: g
                                            });
                                        });
                                        var addGroup = [];
                                        currentGroupRemeber.forEach(function (g) {
                                            if (beforeGroupRemeber.indexOf(g) < 0) addGroup.push({
                                                action: 'ADD',
                                                groupId: g
                                            });
                                        });
                                        var personGroup = addGroup.concat(deleteGroup);
                                        var newIdentityList = [].concat(this.personInfoForm.personIdentity) || [];
                                        (this.beforePersonIdentity || []).forEach(function (identity) {
                                            if (identity.identityType == "Face" || identity.identityType == "FACE") {
                                                newIdentityList.push(identity);
                                            }
                                        });
                                        this.setPersonVehicleTrim();
                                        var param = {
                                            id: this.personInfoForm.id,
                                            personPictures: personPictures,
                                            personAttribute: this.getPersonAttribute(),
                                            //{attributeCode:'',attributeValue:''}
                                            person: {
                                                typeCode: [this.personInfoForm.person.typeCode],
                                                personName: (this.personInfoForm.person.personName || '').trim(),
                                                personNameEn: (this.personInfoForm.person.personNameEn || '').trim(),
                                                gender: this.personInfoForm.person.gender,
                                                status: '',
                                                dateOfBirth: this.personInfoForm.person.dateOfBirth,
                                                personGroup: personGroup
                                            },
                                            // personIdentity:concatSortList(newPersonInfo.beforeIdentityList,newIdentityList).concat(newPersonInfo.faceIdentitys),
                                            personIdentity: this.concatSortList(this.beforePersonIdentity, newIdentityList),
                                            personLocation: {},
                                            //longitude:'',latitude:''
                                            personVehicle: this.concatSortVehicle(this.beforeVehicles, this.personInfoForm.personVehicle),
                                            personOrganization: personOrganization
                                        };
                                        // 弹窗校验
                                        let vres = false;
                                        // 判断勾选了 创建用户 勾选框
                                        if (this.personInfoForm.operatorInfo && this.personInfoForm.operatorInfo.createOperatorFlag) {
                                            if (this.isConfigPassword) {
                                                this.$refs["operatorPasswordFrom"].validate((validResult) => {
                                                    if (validResult) {
                                                        vres = false;
                                                    } else {
                                                        vres = true;
                                                        return false;
                                                    }
                                                });
                                            }
                                            // 同步创建用户信息
                                            param.operatorInfo = {
                                                createOperatorFlag: true,
                                                loginAccount: (this.personInfoForm.person.personNameEn || '').trim(),
                                                nickName: (this.personInfoForm.person.personName || '').trim(),
                                                phoneNumber: this.phone,
                                                password: ""
                                            }
                                            if (this.phone) {
                                                // 创建用户校验电话
                                                vres = this.valiteOperatorPhone(this.phone);
                                            }
                                        }
                                        // 根据系统参数 SystemManagement_IsConfigPassword 判断是否需要输入密码  true:设置用户密码 是必填 false:使用默认密码
                                        if (this.isConfigPassword && this.personInfoForm.operatorInfo.createOperatorFlag && this.personInfoForm.operatorInfo.password) {
                                            param.operatorInfo["password"] = this.personInfoForm.operatorInfo.password;
                                        }
                                        //
                                        if (!vres) {
                                            vres = this.valitePersonIdentity(param);
                                        }
                                        if (!vres) {
                                            vres = this.valitePersonVehicle(param)
                                        }
                                        if (!vres) {
                                            this.updatePerson(param)
                                        } else {
                                            this.sendRequest = true;
                                            return;
                                        }

                                    } else {
                                        this.sendRequest = true;
                                        return;
                                    }
                                    this.sendRequest = false;
                                })

                            }

                        }
                    },
                    // 创建用户校验电话
                    valiteOperatorPhone(value) {
                        let validateError = false;
                        let reg = new RegExp(this.phoneNumberRules);
                        if (!reg.test(value)) {
                            this.$alert(this.lang.phoneNumberMassge, this.lang.error, {
                                type: "error",
                                duration: 2000,
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                            validateError = true;
                        }
                        return validateError;
                    },
                    valitePersonIdentity(param) {
                        let validateError = false;
                        if (param && param.personIdentity.length) {
                            for (var i = 0; i < param.personIdentity.length; i++) {
                                var identityType = param.personIdentity[i]['identityType'];
                                var proofValue = param.personIdentity[i]['proofValue'];
                                if (!identityType.trim()) {
                                    this.$alert(this.lang.certificateTypeNull, this.lang.error, {
                                        type: "error",
                                        duration: 2000,
                                        confirmButtonText: this.lang.oK,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                    validateError = true;
                                    break;
                                }

                                if (!proofValue.trim()) {
                                    this.$alert(this.lang.certificateNumberEmpty, this.lang.error, {
                                        type: "error",
                                        duration: 2000,
                                        confirmButtonText: this.lang.oK,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                    validateError = true;
                                    break;
                                } else {
                                    var identityPattern = /^[A-Za-z0-9]+$/;
                                    if (!identityPattern.test(proofValue) && identityType != "Face" && identityType != "FACE") {
                                        this.$alert(this.lang.certificateOnlyDigitAndNumber, this.lang.error, {
                                            type: "error",
                                            duration: 2000,
                                            confirmButtonText: this.lang.oK,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                        setTimeout(() => {
                                            $('.hw-messagebox').find(".el-button").click();
                                        }, 2000)
                                        validateError = true;
                                        break;
                                    } else if (proofValue.length > 32 && identityType != "Face" && identityType != "FACE") {
                                        this.$alert(this.lang.certificateMaxChar, this.lang.error, {
                                            type: "error",
                                            duration: 2000,
                                            confirmButtonText: this.lang.oK,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                        setTimeout(() => {
                                            $('.hw-messagebox').find(".el-button").click();
                                        }, 2000)
                                        validateError = true;
                                        break;
                                    }
                                }
                            }
                        }
                        return validateError
                    },
                    valitePersonVehicle(param) {
                        let validateError = false;
                        if (param && param.personVehicle.length) {
                            for (var i = 0; i < param.personVehicle.length; i++) {
                                var licensePlateNumber = param.personVehicle[i]['licensePlateNumber'];
                                if (!licensePlateNumber.trim()) {
                                    this.$alert(this.lang.vehicleNumberisNull, this.lang.error, {
                                        type: "error",
                                        confirmButtonText: this.lang.oK,
                                        duration: 2000,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                    validateError = true;
                                    break;
                                }
                                if (!this.validateLicensePlateNumber(licensePlateNumber)) {
                                    validateError = true;
                                    break;
                                }
                                if (!this.validateLicensePlateNumberLength(licensePlateNumber)) {
                                    validateError = true;
                                    break;
                                }
                            }
                        }
                        return validateError
                    },
                    substrPictureName(value) {
                        if (value.length > 64) {
                            value = value.substr(-60);
                            if (value.lastIndexOf("/") > -1) {
                                value = value.substr(value.lastIndexOf("/"));
                            }
                        }
                        return value;
                    },
                    getPersonAttribute() {
                        this.phone = "";
                        var personAttrbutes = [];
                        var personAttrbute = this.personInfoForm.personAttribute || [];
                        if (personAttrbute.length) {
                            personAttrbute.forEach((item) => {
                                var isAdd = true;
                                this.beforePersonInfo.personAttribute.forEach(function (attr) {
                                    if (item.attributeCode === attr.attributeCode && item.attributeValue === attr.attributeValue) {
                                        isAdd = false;
                                    }
                                });
                                if (typeof (item.value) == 'string') item.value = item.value.trim();
                                item.value = item.value ? item.value : "";
                                if (isAdd) {
                                    personAttrbutes.push({
                                        action: 'ADD',
                                        attributeCode: item.attributeCode,
                                        attributeValue: item.attributeValue ? item.attributeValue.trim() : item.attributeValue
                                    });
                                }
                                if (item.attributeCode == 'phone') {
                                    this.phone = item.attributeValue ? item.attributeValue.trim() : item.attributeValue;
                                }
                            });
                        }
                        return personAttrbutes;
                    },
                    // 改变业务用户值
                    portalUserChange(value) {
                        if (value) {
                            this.createOperatorFlagDiasabled = true;
                        } else {
                            this.createOperatorFlagDiasabled = false;
                        }
                    },
                    // 设置用户密码规则
                    userSet() {
                        this.dataErr = {
                            newPsw: false,
                            reNewPsw: false
                        };
                        this.dataErrDesc = {
                            newPsw: '',
                            reNewPsw: ''
                        };
                        this.callConn("/SmartCampus__SystemManagement/1.0.0/getSubjectTypeSettings?subjectTypeCode=operator", {}, "GET", (res) => {
                            if (res.resp.code == '0' && res.data.length > 0) {
                                let resp = res.data[0];
                                this.userSetRule.psw_minLen = resp.resetPasswordMinLength > 0 ? resp.resetPasswordMinLength : 0;
                                this.userSetRule.psw_maxLen = resp.resetPasswordMaxLength > 0 ? resp.resetPasswordMaxLength : 0;
                                this.userSetRule.psw_UpLett = resp.resetPasswordUppercaseLetterRequired;
                                this.userSetRule.psw_LowLett = resp.resetPasswordLowercaseLetterRequired;
                                this.userSetRule.psw_Num = resp.resetPasswordNumberRequired;
                                this.userSetRule.psw_SpecCharc = resp.resetPasswordSpecialCharacterRequired;
                                this.userSetRule.psw_RepeatPasswordNumber = resp.resetPasswordRecordRecentPasswordNumber ? 5 : resp.resetPasswordRecordRecentPasswordNumber;
                                this.userSetRule.psw_RepeatCharts = resp.resetPasswordMinNotRepeatCharts;
                                //
                            }
                        });
                    },
                    // 替换参数
                    stringReplaceWithParam(destination, ...params) {
                        let result = destination;
                        params.forEach((p, key) => {
                            result = result.replace("{" + key + "}", p);
                        })
                        return result;
                    },
                    allSelect(checked) {
                        let list = this.personList;
                        list.forEach(item => {
                            item.checked = checked;
                        })
                        this.personList = list;
                        if (checked) {
                            this.checkedPerson = this.personList.map(item => {
                                return item.id;
                            })
                        } else {
                            this.checkedPerson = [];
                        }
                    },
                    updatePerson(param) {
                        this.callConn("/SmartCampus__PersonManagement/1.0.0/updatePerson", param, "POST", (res) => {
                            if (res.resp.code == '0') {
                                this.$alert(this.lang.modifySuccessContent, this.lang.successfull, {
                                    type: "success",
                                    duration: 2000,
                                    confirmButtonText: this.lang.oK,
                                    customClass: 'hw-messagebox',
                                    callback: () => { }
                                });
                                let index = this.personList.findIndex(value => value.id === param.id);
                                let gender = "";
                                switch (param.person.gender) {
                                    case "MALE":
                                        gender = this.lang.male;
                                        break;
                                    case "FEMALE":
                                        gender = this.lang.female;
                                        break;
                                    case "UNKNOWN":
                                        gender = this.lang.unknown;
                                        break;
                                }
                                let profilePhoto = "";
                                let isHideHeadPortrait = true;
                                if (this.imgUrl) {
                                    profilePhoto = this.imgUrl;
                                }
                                Object.assign(this.personList[index], {
                                    profilePhoto: profilePhoto,
                                    isHideHeadPortrait: isHideHeadPortrait,
                                    personBase: {
                                        personName: param.person.personName,
                                        gender: gender,
                                        personType: this.personList[index].personBase.personType
                                    }
                                })
                                this.showPersonInfoDrawer = false;
                                this.faceImageUrl = []
                            }
                        }, (res) => {
                            this.sendRequest = true;
                            this.$alert(res.response.resMsg, this.lang.error, {
                                type: "error",
                                confirmButtonText: this.lang.oK,
                                duration: 2000,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                        });
                    },
                    concatSortList(beforeArray, array) {
                        var before = Array.isArray(beforeArray) ? beforeArray : [];
                        var current = array || [];
                        var deleteVehicle = [];
                        var modifyVehicle = [];
                        var addVehicle = [];
                        before.forEach((r) => {
                            var isDelet = true;
                            current.forEach((item) => {
                                // 原证件id等于新增证件id相等、原证件与新增加的证件类型与值都相等或者人脸识别的图片被勾选，表示未删除
                                if (item.id === r.id || item.identityType === r.identityType && item.proofValue === r.proofValue || item.identityType === 'FACE' && this.addFaceId.indexOf(r.proofValue) !== -1) {
                                    isDelet = false;
                                }
                            });

                            if (isDelet) {
                                r.action = 'DEL';
                                deleteVehicle.push(r);
                            }
                        });
                        current.forEach(function (r) {
                            var isAdd = true;
                            before.forEach(function (item) {
                                // 原证件id等于新增证件id相等或者原证件与新增加的证件类型与值都相等，表示不需要新增
                                if (item.id === r.id || item.identityType === r.identityType && item.proofValue === r.proofValue) {
                                    isAdd = false;
                                } // 原证件id等于新增证件id相等或者原证件与新增加的证件类型与值至少一个不相等，表示不需要修改
                                if (item.id === r.id && (item.identityType !== r.identityType || item.proofValue !== r.proofValue)) {
                                    isAdd = false;
                                }
                            });

                            if (isAdd) {
                                r.action = 'ADD';
                                addVehicle.push(r);
                            } else {
                                if (deleteVehicle && deleteVehicle.length) {
                                    let isDeleted = false;
                                    deleteVehicle.forEach(deletePic => {
                                        if (deletePic.id === r.id) {
                                            isDeleted = true;
                                        }
                                    });
                                    if (!isDeleted) {
                                        r.action = 'CHG';
                                        let index = before.findIndex(value => value.identityType === r.identityType);
                                        r.id = before[index].id;
                                        modifyVehicle.push(r);
                                    }
                                } else {
                                    r.action = 'CHG';
                                    let index = before.findIndex(value => value.identityType === r.identityType);
                                    r.id = before[index].id;
                                    modifyVehicle.push(r);
                                }
                            }
                        });
                        return deleteVehicle.concat(addVehicle).concat(modifyVehicle);
                    },
                    concatSortVehicle(beforeArray, array) {
                        var beforVehicle = beforeArray || [];
                        var newVehicle = array || [];
                        var deleteArray = [];
                        var addArray = [];
                        var modifyArray = [];
                        beforVehicle.forEach(function (item) {
                            var isDelete = true;
                            newVehicle.forEach(function (vehicle) {
                                if (item.id === vehicle.id) {
                                    isDelete = false;
                                }
                            });
                            if (isDelete) {
                                item.action = "DEL";
                                deleteArray.push(item);
                            }
                        });
                        newVehicle.forEach(function (item) {
                            var isAdd = true;
                            var isModify = false;
                            beforVehicle.forEach(function (vehicle) {
                                if (item.id === vehicle.id || item.licensePlateNumber === vehicle.licensePlateNumber && item.vehicleDesc === vehicle.vehicleDesc) {
                                    isAdd = false;
                                }

                                if (item.id === vehicle.id && (item.licensePlateNumber !== vehicle.licensePlateNumber || item.vehicleDesc !== vehicle.vehicleDesc)) {
                                    isAdd = false;
                                    isModify = true;
                                }
                            });
                            if (isAdd) {
                                item.action = "ADD";
                                addArray.push(item);
                            }

                            if (isModify) {
                                item.action = "CHG";
                                modifyArray.push(item);
                            }
                        });
                        return deleteArray.concat(addArray).concat(modifyArray);
                    }, // 组装groupMember
                    getAttchmentName(id) {
                        var name = "";
                        this.beforeAttchment.forEach(function (item) {
                            if (item.id === id) {
                                name = item.name;
                            }
                        })
                        return name;
                    },
                    queryPersonDefinition(value) {
                        var params = {
                            start: 0,
                            limit: 500,
                            condition: {
                                typeCode: {
                                    value: value,
                                    operator: '='
                                }
                            }
                        };
                        this.callConn("/Person/0.1.0/PersonDef/query", params, "POST", (res) => {
                            var identityTypeList = [];
                            var personAttribute = [];
                            if (res.resp.code == '0' && res.data[0].personDefs) {
                                res.data[0].personDefs.forEach(item => {
                                    if (item.personDefAttr && item.personDefAttr.length) {
                                        let personDefAttr = item.personDefAttr;
                                        var numberRule = {
                                            "type": 'number',
                                            "message": this.lang.enterNumber,
                                            "trigger": 'blur',
                                            "transform": function transform(valueItem) {
                                                return parseInt(valueItem);
                                            }
                                        };
                                        // 业务用户放最后
                                        let portalUserAttrDefLast = {};
                                        // 计算循环次数
                                        let currentIndex = 0;
                                        // 人员属性总共数组长度
                                        let attrTatalCount = personDefAttr.length;
                                        personDefAttr.forEach((personDef, i) => {
                                            currentIndex++;
                                            var rules = [{
                                                required: personDef.isMandatory,
                                                message: this.lang.enter + personDef.attrDef.attrLabel,
                                                trigger: 'blur'
                                            }];
                                            if (personDef.attrDef.primaryType === 'Number') {
                                                rules.push(numberRule);
                                            }
                                            var attrDef = {
                                                id: personDef.attrDef.id,
                                                code: personDef.attrDef.code,
                                                label: personDef.attrDef.attrLabel,
                                                type: personDef.attrDef.primaryType,
                                                value: '',
                                                placeholder: this.lang.enter + personDef.attrDef.attrLabel,
                                                rules: rules,
                                                isEncryption: personDef.attrDef.isEncryption,
                                                noDataText: ''
                                            };
                                            // 枚举类型获取所有选项
                                            var EnumerationRules = [{
                                                required: personDef.isMandatory,
                                                message: this.lang.select + personDef.attrDef.attrLabel,
                                                trigger: 'blur'
                                            }];
                                            // 判断属性是枚举类型
                                            if (attrDef.type === 'Enumeration' && personDef.attrDef && personDef.attrDef.picklistName) {
                                                attrDef['options'] = JSON.parse(personDef.attrDef.picklistName);
                                                attrDef['placeholder'] = this.lang.select + personDef.attrDef.attrLabel;
                                                attrDef['rules'] = EnumerationRules;
                                                if (attrDef['code'] === "portalUser") {
                                                    this.hasPortalUser = true;
                                                    attrDef['placeholder'] = this.lang.selectOrSearch + personDef.attrDef.attrLabel;
                                                    attrDef['filterable'] = true;
                                                    attrDef['remote'] = true;
                                                    attrDef['noDataText'] = this.lang.noData;
                                                    var portalUserName = "";
                                                    if (this.portalUserInfo && this.portalUserInfo.length) {
                                                        this.portalUserInfo.forEach(operator => {
                                                            if (operator.loginAccounts) {
                                                                operator.loginAccounts.forEach(account => {
                                                                    if (account.loginAccountTypeName === "EmployeeNo") {
                                                                        portalUserName = account.loginAccount;
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                    if (portalUserName) {
                                                        attrDef['options'] = [{
                                                            value: this.portalUserId,
                                                            label: portalUserName
                                                        }];
                                                    }
                                                    portalUserAttrDefLast = attrDef;
                                                }
                                                // 根据安保类型必填的属性设置特定的默认值 
                                                if (value == "SECURITY" && personDef.isMandatory) {
                                                    switch (personDef['attrDef']['code']) {
                                                        case 'ipProtocolType':
                                                            // 终端注册 默认选择SIP
                                                            attrDef['value'] = '1';
                                                            break;
                                                        case 'dialMode':
                                                            // 连接模式 默认选择-拔出
                                                            attrDef['value'] = 'OUT';
                                                            break;
                                                        case 'rate':
                                                            // 速率 默认选择-1920kbit/s
                                                            attrDef['value'] = '1920';
                                                            break;
                                                    }
                                                } else if (value != "SECURITY" && personDef.isMandatory) {
                                                    // 不是安保类型的必填下拉默认选择第一个下拉数据
                                                    attrDef['value'] = attrDef['options'][0] ? attrDef['options'][0]["value"] : "";
                                                }
                                            } else if (attrDef.type === 'Enumeration') {
                                                attrDef['options'] = [];
                                                attrDef['placeholder'] = this.lang.select + personDef.attrDef.attrLabel;
                                                attrDef['rules'] = EnumerationRules;
                                                if (attrDef['code'] === "portalUser") {
                                                    attrDef['filterable'] = true;
                                                    attrDef['remote'] = true;
                                                    attrDef['noDataText'] = "无数据";
                                                    var portalUserNames = "";
                                                    if (this.portalUserInfo && this.portalUserInfo.length) {
                                                        this.portalUserInfo.forEach(operator => {
                                                            portalUserNames = operator.employeeNo;
                                                        });
                                                    }
                                                    if (portalUserNames) {
                                                        attrDef['options'] = [{
                                                            value: this.portalUserId,
                                                            label: portalUserNames
                                                        }];
                                                    }
                                                }
                                            }
                                            if (attrDef['code'] != "portalUser") {
                                                personAttribute.push(attrDef);
                                            }
                                            // 业务用户放在最后
                                            if (portalUserAttrDefLast && portalUserAttrDefLast['code'] === "portalUser" && attrTatalCount == currentIndex) {
                                                personAttribute.push(portalUserAttrDefLast);
                                            }
                                        });
                                    }
                                    item.identityDef.forEach(function (idef) {
                                        if (idef.identityName != "Face" && idef.identityCode != "FACE") {
                                            identityTypeList.push({
                                                label: idef.identityName + " (" + idef.identityCode + ")",
                                                value: idef.identityCode
                                            });
                                        }
                                    });
                                })
                            }
                            this.personAttrList = personAttribute;
                            if (!this.personAttrList.length) {
                                this.hideAtribute = false;
                            } else {
                                this.hideAtribute = true;
                            }
                            this.identityTypeList = identityTypeList;

                            if (this.personInfoForm.personIdentity.length >= identityTypeList.length) {
                                this.addIdentityDisable = true;
                            } else {
                                this.addIdentityDisable = false;
                            }
                        });

                    },

                    async showOrganizationTree(org) {
                        let orgTree = await this.queryOrganizationTree(org.id, true);
                        this.currentOperatorOrgTree = [];
                        this.defaultExpandOrgTreeKey.push(orgTree.id)
                        orgTree.children.forEach(item => {
                            item['leaf'] = !item.hasChildren;
                        })
                        this.currentOperatorOrgTree.push({
                            ...orgTree
                        });
                        setTimeout(() => {
                            this.$refs['orgTree'].$el.children[0].click();
                        })
                    },

                    addPersonIdentitys() {
                        this.personInfoForm.personIdentity.push({
                            id: new Date().getTime(),
                            identityType: "",
                            proofValue: "",
                            action: "ADD"
                        })
                        if (this.personInfoForm.personIdentity.length >= this.identityTypeList.length) {
                            this.addIdentityDisable = true;
                            return;
                        }
                    },
                    onExceed(file, fileList) {
                        this.$alert(this.lang.numberExceededMaxNumber, this.lang.error, {
                            type: "error",
                            confirmButtonText: this.lang.oK,
                            customClass: 'hw-messagebox',
                            callback: () => { }
                        });
                    },
                    addPersonLicense() {
                        this.personInfoForm.personVehicle.push({
                            id: new Date().getTime(),
                            licensePlateNumber: "",
                            vehicleDesc: "",
                            status: "ACTIVE"
                        })
                        if (this.personInfoForm.personVehicle.length >= this.maxPersonVehicle) {
                            this.addLicenseDisable = true;
                            return;
                        }
                    },
                    addPersonOrgnization() {
                        this.personInfoForm.personOrganization.push({
                            id: new Date().getTime(),
                            organizationId: "",
                            organizationCode: "",
                            organizationName: "",
                            organizationDesc: ""
                        })
                        if (this.personInfoForm.personOrganization.length >= this.maxPersonOrganization) {
                            this.addOrganizationDisable = true;
                            return;
                        }
                    },
                    selectPersonOrg(data, node, nodeDom) {
                        console.log("node",node);
                        if(node.key == this.hmCenter){
                            node.checked = true
                        }else{
                            node.checked = false
                        }
                        if (node.checked) {
                            node.checked = false;
                            node.isCurrent = false;
                            nodeDom.$el.blur();
                            this.$refs['orgTree'].setCurrentKey(null);
                            this.queryPersonParam = {
                                start: this.queryStart,
                                limit: this.pageSize,
                                condition: {}
                            }
                            if (this.currentOperatorOrgIds.length) {
                                this.queryPersonParam.condition = {
                                    organizationId: {
                                        valueList: this.currentOperatorOrgIds,
                                        operator: "in"
                                    }
                                }
                            }
                        } else {
                            console.log("未选中",data.id)
                            this.$refs['orgTree'].setCheckedKeys([]);
                            node.checked = true;
                            setTimeout(() => {
                                node.childNodes.forEach(item => {
                                    item.checked = false;
                                })
                            },500)

                            this.queryPersonParam = {
                                start: this.queryStart,
                                limit: this.pageSize
                            }
                            this.queryPersonParam["condition"] = {
                                organizationParentId: {
                                    value: data.id,
                                    operator: "="
                                }
                            }
                        }
                        if (this.personName) {
                            this.queryPersonParam.condition["personName"] = {
                                "value": this.personName,
                                "operator": "like"
                            }
                        } else {
                            if (this.queryPersonParam.condition && this.queryPersonParam.condition["personName"]) {
                                delete this.queryPersonParam.condition["personName"]
                            }
                        }
                       this.queryPerson();
                    },
                    refreshFaceUrl(param) {
                        return new Promise(resolve => {
                            this.callConn("/SmartCampus__PersonManagement/1.0.0/refreshPersonFaceUrl", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    resolve(res.data[0].convertUrl);
                                }
                            });
                        })
                    },
                    transformFaceToBase64(param) {
                        return new Promise(resolve => {
                            this.callConn("/SmartCampus__PersonManagement/1.0.0/transformFaceUrlToBase64", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    resolve(res.data[0].personFace);
                                }
                            });
                        })
                    },
                    queryRootOrganization() {
                        let organizationRootList = [];
                        let param = {
                            start: 0,
                            limit: 3000,
                            condition: {}
                        }
                        return new Promise(resolve => {
                            this.callConn("/Organization/0.1.0/OrganizationRoot/query", param, "POST", (res) => {
                                if (res.resp.code == '0' && res.data[0].organizationRoots) {
                                    organizationRootList = res.data[0].organizationRoots;
                                }
                                resolve(organizationRootList);
                            });
                        })
                    },
                    queryPersonTypeList() {
                        let personType = [];
                        let personTypeParam = {
                            start: 0,
                            limit: 5000,
                            condition: {}
                        };
                        this.callConn("/Person/0.1.0/PersonDef/query", personTypeParam, "POST", (res) => {
                            if (res.resp.code == '0' && res.data[0].personDefs) {
                                res.data[0].personDefs.forEach(item => {
                                    var typeObj = {};
                                    typeObj.value = item.code;
                                    typeObj.label = item.typeName + " (" + item.code + ")";
                                    personType.push(typeObj)
                                })
                            }
                            this.personTypeList = personType;
                        });
                    },
                    //fuck
                    queryPerson() {
                        let param = this.queryPersonParam;
                        // this.callConn("/SmartCampus__PersonManagement/1.0.0/queryPersonsWithCurOrg", param, "POST", (res) => {
                        this.callConn("/hm_bigScreen__HMSecurityManagement/1.0.0/queryPersonsWithCurOrg", param, "POST", (res) => {
                            if (res.resp.code == '0') {
                                this.personTotalSize = res.data[0].count;
                                if (res.data[0].persons.length) {
                                    res.data[0].persons.forEach(item => {
                                        // if(item.personOrganization.length > 0){
                                        //     //hgzz
                                        //     console.log(item.personOrganization[0].organization)
                                        //     this.queryOrganizationByOrgid(item.personOrganization[0].organization).then(data=>{
                                        //         console.log(data)
                                        //         if(data.length > 0){
                                        //             // item.personOrganization[0].organizationName = data[0].organizationName
                                        //             item.personOrganization[0].organizationName = 1
                                        //         }
                                        //     })
                                        // }

                                        //取出personAttr中的personLevel数据，放入personBase中，方便显示
                                        if(item.personAttr){
                                            for(let i=0;i<item.personAttr.length;i++){
                                                if(item.personAttr[i].attrDef.code == 'personLevel' ){
                                                    console.log(item.personAttr[i].attrValue)
                                                    item.personBase['personLevel'] = item.personAttr[i].attrValue
                                                }
                                                if(item.personAttr[i].attrDef.code == 'Region' ){
                                                    console.log(item.personAttr[i].attrValue)
                                                    item.personBase['region'] = item.personAttr[i].attrValue
                                                }
                                            }
                                        }
                                        if (item.personBase.gender) {
                                            switch (item.personBase.gender) {
                                                case "MALE":
                                                    item.personBase.gender = this.lang.male;
                                                    break;
                                                case "FEMALE":
                                                    item.personBase.gender = this.lang.female;
                                                    break;
                                                case "UNKNOWN":
                                                    item.personBase.gender = this.lang.unknown;
                                                    break;
                                            }
                                        }
                                        if (item.personAttachment && (item.personAttachment || []).length > 0) {
                                            for (let i = 0; i < item.personAttachment.length; i++) {
                                                if (item.personAttachment[i].attachmentType === 'PICTURE') {
                                                    item.profilePhoto = item.personAttachment[i].url ? item.personAttachment[i].url : item.personAttachment[i].content ? "data:image;base64," + item.personAttachment[i].content : null;
                                                }
                                            }
                                        }
                                        item['isHideHeadPortrait'] = true;
                                        item['checked'] = false;
                                        if (item.status == 'DISABLED') {
                                            item['isDiscard'] = this.lang.isDiscarded
                                        } else {
                                            item['isDiscard'] = "";
                                        }

                                    })
                                }
                                this.personList = res.data[0].persons;
                                console.log(this.personList)
                                this.checkedPerson = [];
                            }
                        });
                    },
                    resetQueryDef(value) {
                        this.personInfoForm.personIdentity = [];
                        this.hasPortalUser = false;
                        this.personInfoForm.operatorInfo.createOperatorFlag = false;
                        this.queryPersonDefinition(value);
                    },
                    querypersonById(param) {
                        return new Promise(resolve => {
                            this.callConn("/Person/0.1.0/Person/query", param, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    resolve(res.data[0].persons);
                                }

                            });
                        })
                    },
                    getChildrenId(organization) {
                        let idArr = []
                        if (idArr.indexOf(organization.id) < 0) {
                            idArr.push(organization.id)
                        }
                        idArr.push(organization.id);
                        if (organization.children && organization.children.length > 0) {
                            organization.children.forEach((item) => {
                                idArr.push(...this.getChildrenId(item));
                            })
                        }
                        return idArr;
                    },
                    getChildOrg(organization) {
                        let idArr = []
                        idArr.push(organization);
                        if (organization.children && organization.children.length > 0) {
                            organization.children.forEach((item) => {
                                idArr.push(...this.getChildOrg(item));
                            })
                        }
                        return idArr;
                    },
                    // 校验用户是否存在创建操作员权限，不存在不显示勾选框
                    isHasCreateOperatorPermission(permissionResources) {
                        let hasCreateOperatorPermission = false;
                        if (permissionResources && permissionResources.length && !hasCreateOperatorPermission) {
                            permissionResources.forEach(item => {
                                if (item && (item.resource == "SystemManagement_Operator_Create")) {
                                    hasCreateOperatorPermission = true;
                                }
                            })
                        }
                        return hasCreateOperatorPermission;
                    },
                    hasModifyPermission(currentOperatorPermissions) {
                        let modifyPermission = false;
                        let queryPermission = false;
                        if (currentOperatorPermissions && currentOperatorPermissions.length) {
                            currentOperatorPermissions.forEach(item => {
                                if (item && (item === "人员更新" || item === "Staff update")) {
                                    // 当前用户有更新权限，后面还有js判断，根据系统参数Common_ManageByOperatorOrg 的值和全人员管理权限判断，如果用户有全人员管理权限只需要有人员更新权限就可以使用全部功能；如果没有全人员管理权限并且Common_ManageByOperatorOrg为true，当前用户有组织，则所有功能可以使用，否则所有功能不能使用。
                                    // Current user has update permissions, followed by JS judgment, according to the system parameter Common_ManageByOperatorOrg value and full staff management permissions judgment, if the user has full staff management permissions only need to have staff update permissions can use all functions; If you do not have full staff management privileges and Common_ManageByOperatorOrg is true and the current user is organized, all functionality can be used, otherwise all functionality cannot be used.
                                    modifyPermission = true;
                                } else if (item && (item === "人员查看" || item === "People view")) {
                                    // 当前用户有查看权限，后面还有js判断，根据系统参数Common_ManageByOperatorOrg 的值和全人员管理权限判断，如果用户有全人员管理权限只需要有人员查看权限就可以使用查看和导出功能；如果没有全人员管理权限并且Common_ManageByOperatorOrg为true，当前用户有组织，则查看和导出功能可以使用，否则所有功能不能使用
                                    // The current user has view permissions, followed by JS judgment, according to the system parameter Common_ManageByOperatorOrg value and full staff management permissions judgment, if the user has full staff management permissions only need staff view permissions can use the view and export function; If you do not have full staff management privileges and Common_ManageByOperatorOrg is true and the current user is organized, the view and export functions can be used, otherwise all functions cannot be used.
                                    queryPermission = true;
                                }
                            })
                        }
                        if (!modifyPermission && queryPermission) {
                            return true
                        }
                        return false
                    },
                    handleRemove(file) {
                        this.$refs['faceUpload'].uploadFiles.splice(0, 1);
                        this.$refs['faceUpload'].fileList.splice(0, 1);
                        this.uploadFileList.splice(0, 1);
                    },
                    getSysParam() {
                        return new Promise(resolve => {
                            this.callConn("/SmartCampus__PersonManagement/1.0.0/getPersonMgmtConfig", {}, "POST", (res) => {
                                if (res.resp.code == '0') {
                                    const configList = res.data.configList;
                                    let configObj = {}
                                    configList.forEach(item => {
                                        if (!configObj[item['name']]) {
                                            configObj[item['name']] = item['value'];
                                        }
                                    })
                                    resolve(configObj);
                                }
                            });
                        })
                    },
                    getPicklist(picklistId) {
                        let list = [];
                        return new Promise(resolve => {
                            this.callConn("/Common/0.1.0/queryPicklistById?picklistId=" + picklistId, {}, "GET", (res) => {
                                if (res.resp.code == '0' && res.data[0].picklistData.length) {
                                    res.data[0].picklistData.forEach(item => {
                                        list.push({
                                            label: item.label,
                                            value: item.value
                                        })
                                    })
                                }
                                resolve(list);
                            });
                        })
                    },
                    verifyLogin() {
                        return new Promise(resolve => {
                            let identityId = "";
                            this.callConn("/SmartCampus__UnifiedPortal/1.0.0/verifyLogin", {}, "POST", (res) => {
                                if (res.resp.code == '0' && res.data[0].identityId) {
                                    identityId = res.data[0].identityId || '';
                                }
                                resolve(identityId);
                            });
                        });
                    },
                    lookUpPersonGroup() {
                        let id = this.$refs["groupTree"].getCurrentKey();
                        if (!id) {
                            this.$alert(this.lang.selectPersonGroupView, this.lang.error, {
                                type: "error",
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                        } else {
                            let index = this.personGroupData[0].children.findIndex(value => value.id === id);
                            this.personGroupForm.groupName = this.personGroupData[0].children[index]["groupName"];
                            this.personGroupForm.groupType = this.personGroupData[0].children[index]["groupType"];
                            this.personGroupForm.groupDesc = this.personGroupData[0].children[index]["groupDesc"];
                            this.showLookGroupDialog = true;
                        }
                    },
                    handleDeleteIdentity(index, row) {
                        this.personInfoForm.personIdentity.splice(index, 1);
                        if (this.personInfoForm.personIdentity.length < this.identityTypeList.length) {
                            this.addIdentityDisable = false;
                        }
                    },
                    handleDeletelicense(index, row) {
                        this.personInfoForm.personVehicle.splice(index, 1);
                        if (this.personInfoForm.personVehicle.length < this.maxPersonVehicle) {
                            this.addLicenseDisable = false;
                        }
                    },
                    handleDeleteOrganization(index, row) {
                        this.personInfoForm.personOrganization.splice(index, 1);
                        if (this.personInfoForm.personOrganization.length < this.maxPersonOrganization) {
                            this.addOrganizationDisable = false;
                        }
                    },
                    getCurrentOperatorPermission() {
                        return new Promise(resolve => {
                            let permissions = [];
                            this.callConn("/SmartCampus__SystemManagement/1.0.0/getCurrenOperatorPermission", {}, "GET", (res) => {
                                if (res.resp.code == '0' && res.data[0].permissions) {
                                    permissions = res.data[0].permissions.map(item => {
                                        if (item.name == '用户管理') {
                                            this.operaorPermissionResources = item.permissionResources;
                                        }
                                        return item.name;
                                    })
                                }
                                resolve(permissions);
                            });
                        });
                    },
                    getCurrentOperator() {
                        return new Promise(resolve => {
                            let operators = [];
                            this.callConn("/SmartCampus__SystemManagement/1.0.0/queryCurrentOperator", {}, "POST", (res) => {
                                if (res.resp.code == '0' && res.data[0].operators) {
                                    operators = res.data[0].operators
                                }
                                resolve(operators);
                            });
                        });
                    },
                    addPersonGroup() {
                        let param = this.personGroupForm;
                        this.$refs["groupForm"].validate((valid) => {
                            if (valid) {
                                this.callConn("/Person/0.1.0/PersonGroup/add", param, "POST", (res) => {
                                    if (res.resp.code == '0' && res.data[0].id) {
                                        let personGroup = {
                                            id: res.data[0].id,
                                            ...param,
                                            label: param['groupName'],
                                        }
                                        let personGroupIns = {
                                            value: res.data[0].id,
                                            label: param['groupName']
                                        }
                                        this.hidePersonGroupDialog();
                                        this.$alert(this.lang.groupCreatedSuccessfully, this.lang.successfull, {
                                            type: "success",
                                            confirmButtonText: this.lang.oK,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                        setTimeout(() => {
                                            $('.hw-messagebox').find(".el-button").click();
                                        }, 2000)
                                        if (this.searchGroupKeyword) {
                                            this.queryPersonGroupList(1);
                                            return;
                                        }
                                        this.personGroupData[0].children.unshift(personGroup);
                                        this.allPersonGroup.push(personGroupIns);
                                    }
                                }, (res) => {
                                    if (res.response.resCode === 'Person.RecordAlreadyExist') {
                                        res.response.resMsg = this.lang.groupAlreadyExists;
                                    }
                                    this.$alert(res.response.resMsg, this.lang.error, {
                                        type: "error",
                                        confirmButtonText: this.lang.oK,
                                        customClass: 'hw-messagebox',
                                        callback: () => { }
                                    });
                                    setTimeout(() => {
                                        $('.hw-messagebox').find(".el-button").click();
                                    }, 2000)
                                })
                            } else {
                                return false;
                            }
                        });
                    },
                    updatePersonGroup(id) {
                        let param = this.personGroupForm;
                        this.$refs["groupForm"].validate((valid) => {
                            if (valid) {
                                this.callConn("/Person/0.1.0/PersonGroup/update/" + id, param, "POST", (res) => {
                                    if (res.resp.code == '0') {
                                        let personGroup = {
                                            id: id,
                                            ...param,
                                            label: param['groupName'],
                                        }
                                        let index = this.personGroupData[0].children.findIndex(value => value.id === id);
                                        this.personGroupData[0].children[index] = Object.assign(this.personGroupData[0].children[index], personGroup);
                                        this.hidePersonGroupDialog();
                                        this.$alert(this.lang.groupUpdatedSuccessfully, this.lang.successfull, {
                                            type: "success",
                                            confirmButtonText: this.lang.oK,
                                            customClass: 'hw-messagebox',
                                            callback: () => { }
                                        });
                                        setTimeout(() => {
                                            $('.hw-messagebox').find(".el-button").click();
                                        }, 2000)
                                    }
                                })
                            } else {
                                return false;
                            }
                        });
                    },
                    getPersonGroupList(param) {
                        this.callConn("/Person/0.1.0/PersonGroup/query", param, "POST", (res) => {
                            let goupList = [];
                            if (res.resp.code == '0' && res.data[0].personGroups.length > 0) {
                                let personGroups = res.data[0].personGroups;
                                this.groupTotalSize = Math.ceil(res.data[0].count / this.groupPageSize);
                                personGroups.forEach(item => {
                                    goupList.push({
                                        label: item.groupName,
                                        ...item
                                    })
                                })
                                if (this.groupCurrentPage === 1) {
                                    this.loading(false);
                                    this.personGroupData[0].children.push(...goupList)
                                    this.isLoading = true;
                                } else {
                                    setTimeout(() => {
                                        this.loading(false);
                                        this.personGroupData[0].children.push(...goupList)
                                        this.isLoading = true;
                                    }, 2000)
                                }
                            } else {
                                $(".loading").html(this.lang.noData);
                                setTimeout(() => {
                                    this.loading(false);
                                }, 1000)
                            }
                        });
                    },
                    queryAllPersonGroup() {
                        let param = {
                            start: 0,
                            limit: 5000,
                            condition: {}
                        }
                        this.callConn("/Person/0.1.0/PersonGroup/query", param, "POST", (res) => {
                            let goupList = [];
                            if (res.resp.code == '0' && res.data[0].personGroups.length > 0) {
                                res.data[0].personGroups.forEach(item => {
                                    goupList.push({
                                        value: item.id,
                                        label: item.groupName
                                    })
                                })
                            }
                            this.allPersonGroup = goupList;
                        });
                    },
                    selectPersonGroup(data, node, nodeDom) {
                        if (node.checked) {
                            node.checked = false;
                            node.isCurrent = false;
                            nodeDom.$el.blur();
                            this.$refs['groupTree'].setCurrentKey(null);
                            this.currentPage = 1;
                            this.queryPersonParam = {
                                start: this.queryStart,
                                limit: this.pageSize,
                                condition: {}
                            }
                            if (this.currentOperatorOrgIds.length) {
                                this.queryPersonParam.condition = {
                                    organizationId: {
                                        valueList: this.currentOperatorOrgIds,
                                        operator: "in"
                                    }
                                }
                            }
                            if (this.personName) {
                                this.queryPersonParam.condition["personName"] = {
                                    "value": this.personName,
                                    "operator": "like"
                                }
                            } else {
                                delete this.queryPersonParam.condition["personName"]
                            }
                        } else {
                            this.currentPage = 1;
                            this.$refs['groupTree'].setCheckedKeys([]);
                            node.checked = true;
                            this.queryPersonParam = {
                                start: this.queryStart,
                                limit: this.pageSize,
                                condition: {}
                            }
                            this.queryPersonParam["condition"] = {
                                personGroupId: {
                                    value: data.id,
                                    operator: "="
                                }
                            }
                            if (this.currentOperatorOrgIds.length) {
                                this.queryPersonParam.condition['organizationId'] = {
                                    valueList: this.currentOperatorOrgIds,
                                    operator: "in"
                                }
                            }
                            if (this.personName) {
                                this.queryPersonParam.condition["personName"] = {
                                    "value": this.personName,
                                    "operator": "like"
                                }
                            } else {
                                delete this.queryPersonParam.condition["personName"]
                            }
                        }
                        if (node.id === 1) {
                            this.queryPersonParam.condition = {};
                        }
                        this.queryPerson();
                    },
                    search() {
                        if (this.personName) {
                            this.queryPersonParam.condition["personName"] = {
                                "value": this.personName,
                                "operator": "like"
                            }
                        } else {
                            delete this.queryPersonParam.condition["personName"];
                        }
                        this.currentPage = 1;
                        this.queryPerson();
                    },
                    resetSearch() {
                        this.personName = null;
                        delete this.queryPersonParam.condition["personName"];
                        this.queryPerson();
                    },
                    deletePersonGroup(id) {
                        this.callConn("/Person/0.1.0/PersonGroup/" + id, {}, "DELETE", (res) => {
                            let index = this.personGroupData[0].children.findIndex(value => value.id === id);
                            this.personGroupData[0].children.splice(index, 1);
                            this.$refs["groupTree"].setCurrentKey(null)
                            this.$refs['groupTree'].setCheckedKeys([]);
                            this.queryPersonParam.condition = {};
                            this.queryPerson();
                            this.$alert(this.lang.personGroupInfoDeletedSuccessfully, this.lang.successfull, {
                                type: "success",
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                        })
                    },
                    checkDeletePersonGroup() {
                        let id = this.$refs["groupTree"].getCurrentKey();
                        if (!id) {
                            this.$alert(this.lang.selectGroupInfoMessageToDelete, this.lang.error, {
                                type: "error",
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                        } else {
                            this.$confirm(this.lang.personGroupInfoDeleteConfirmationMessage, this.lang.prompt, {
                                confirmButtonText: this.lang.oK,
                                cancelButtonText: this.lang.cancel,
                                type: 'warning',
                                customClass: 'hw-messagebox',
                            }).then(() => {
                                this.deletePersonGroup(id);
                            });
                        }
                    },
                    checkUpdatePersonGroup() {
                        let id = this.$refs["groupTree"].getCurrentKey();
                        if (!id) {
                            this.$alert(this.lang.selectPersonGroup, this.lang.error, {
                                type: "error",
                                confirmButtonText: this.lang.oK,
                                customClass: 'hw-messagebox',
                                callback: () => { }
                            });
                            setTimeout(() => {
                                $('.hw-messagebox').find(".el-button").click();
                            }, 2000)
                        } else {
                            let index = this.personGroupData[0].children.findIndex(value => value.id === id);
                            this.personGroupForm.groupName = this.personGroupData[0].children[index]["groupName"];
                            this.personGroupForm.groupType = this.personGroupData[0].children[index]["groupType"];
                            this.personGroupForm.groupDesc = this.personGroupData[0].children[index]["groupDesc"]
                            this.showPersonGroupDialog = true;
                            this.modifyPersonGroup = true;
                            this.personGroupTitle = this.lang.modifyPersonGroup;
                        }
                    },
                    searchGroup(value) {
                        if (this.timer) {
                            clearTimeout(this.timer);
                        }
                        this.timer = setTimeout(() => {
                            this.personGroupData[0].children = [];
                            this.searchGroupKeyword = value;
                            this.groupCurrentPage = 1;
                            this.queryPersonGroupList(this.groupCurrentPage);
                            this.timer = null
                        }, 1000)
                    },
                    handleClick(tab, event) {
                        this.$refs['groupTree'].setCheckedKeys([]);
                        this.$refs['groupTree'].setCurrentKey(null);
                        this.$refs['orgTree'].setCheckedKeys([]);
                        this.$refs['orgTree'].setCurrentKey(null);
                        this.queryPersonParam.condition = {};
                        this.queryPerson();
                    },
                    toggleDropdown() {
                        this.dropdownOpen = !this.dropdownOpen;
                        this.dropdownClose = !this.dropdownClose;
                    },
                    handleSizeChange(val) {
                        this.pageSize = val;
                    },
                    handleCurrentChange(val) {
                        this.currentPage = val;
                    },
                    checkAddPersonGroup() {
                        this.showPersonGroupDialog = true;
                        this.modifyPersonGroup = false;
                        this.personGroupTitle = this.lang.addPersonGroup
                        this.$nextTick(value => {
                            this.$refs["groupForm"].resetFields();
                            Object.keys(this.personGroupForm).forEach(item => {
                                this.personGroupForm[item] = "";
                            });
                        })

                    },
                    selectOrg(value, index) {
                        if (value && value.length) {
                            let org = this.orgInsObj[value[value.length - 1]];
                            this.personInfoForm.personOrganization[index].organizationId = org['id'];
                            this.personInfoForm.personOrganization[index].organizationCode = org["code"];
                            this.personInfoForm.personOrganization[index].organizationDesc = org["description"];
                        }
                    },
                    doEditOrAddPersonGroup() {
                        if (!this.modifyPersonGroup) {
                            this.addPersonGroup();
                        } else {
                            let id = this.$refs["groupTree"].getCurrentKey();
                            this.updatePersonGroup(id);
                        }
                    },
                    hidePersonGroupDialog() {
                        this.showPersonGroupDialog = false;
                        this.$refs["groupForm"].resetFields();
                    },
                    callConn: function (service, param, type, callbackFunc, errorFunc) {
                        var _this = this;
                        var connector = null;
                        switch (type.toUpperCase()) {
                            case 'POST':
                                connector = thisObj.getConnectorInstanceByName('APIConnector_POST');
                                break;
                            case 'GET':
                                connector = thisObj.getConnectorInstanceByName('APIConnector_GET');
                                break;
                            case 'PUT':
                                connector = thisObj.getConnectorInstanceByName('APIConnector_PUT');
                                break;
                            case 'DELETE':
                                connector = thisObj.getConnectorInstanceByName('APIConnector_DELETE');
                                break;
                            default:
                                connector = thisObj.getConnectorInstanceByName('APIConnector_POST');
                                break;
                        }
                        if (connector) {
                            connector.setInputParams({
                                service: service,
                                needSchema: 'data'
                            }); //异步（默认）
                            if (param.async === false) {
                                connector.setInputParams({
                                    service: service,
                                    needSchema: 'data',
                                    async: false
                                }); //同步
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
                                    if (typeof errorFunc === "function") {
                                        errorFunc.call(_this, response)
                                    } else {
                                        // 人脸检测失败提示人脸服务异常
                                        let errMessage = response.response.resMsg;
                                        if (response.response.resCode === "Person.DetectFace_NetError") {
                                            errMessage = _this.lang.recognitionException;
                                        } else if (response.response.resCode === "Person.addImageFailed") {
                                            errMessage = _this.lang.addFaceFailed;
                                        }
                                        _this.$alert(errMessage, _this.lang.error, {
                                            type: "error",
                                            confirmButtonText: _this.lang.oK,
                                            customClass: 'hw-messagebox',
                                            callback: () => { },
                                            duration: 2000
                                        });
                                        setTimeout(() => {
                                            $('.hw-messagebox').find(".el-button").click();
                                        }, 2000)
                                    }
                                })
                        }
                    }
                },
                computed: {},
                watch: {
                    searchOrganizationWord(val) {
                        this.$refs['orgTree'].filter(val);
                    },
                    currentPage(value) {
                        //
                        this.queryStart = (value - 1) * this.pageSize;
                        Object.assign(this.queryPersonParam, {
                            start: this.queryStart
                        })
                        this.queryPerson();
                    },
                    pageSize(value) {
                        Object.assign(this.queryPersonParam, {
                            limit: value
                        })
                        this.queryPerson();
                    },
                    "personInfoForm.operatorInfo.createOperatorFlag": function (value) {
                        this.portalUserDiasabled = value;
                        // 勾选创建用户 业务用户置空置灰
                        if (value) {
                            // 校验英文名必填，规则校验
                            this.personInfoFormRules['person.personNameEn'][0].required = true;
                            this.personInfoForm.personAttribute.forEach(item => {
                                if (item.attributeCode == 'portalUser') {
                                    item.attributeValue = "";
                                }
                            })
                        } else {
                            // 没勾选英文名不必填
                            this.personInfoFormRules['person.personNameEn'][0].required = false;
                            this.$refs.personForm.validateField("person.personNameEn");
                            this.operatorPasswordFrom.password = '';
                            this.operatorPasswordFrom.repeatPassword = '';
                        }
                    },
                    personAttrList(value) {
                        this.personInfoForm.personAttribute = [];
                        if (value.length) {
                            value.forEach(item => {
                                this.personInfoForm.personAttribute.push({
                                    attributeCode: item.code,
                                    attributeValue: item.value
                                })
                            })
                        }
                        if (this.personAttr.length) {
                            let attrObj = {}
                            this.personAttr.forEach(item => {
                                if (!attrObj[item['attributeCode']]) {
                                    attrObj[item['attributeCode']] = item.attributeValue;
                                }
                            })
                            this.personInfoForm.personAttribute.forEach(item => {
                                item.attributeValue = attrObj[item.attributeCode] ? attrObj[item.attributeCode] : this.isChecked ? " " : "";
                            })
                        }
                    },
                    checkedPerson(value) {
                        if (this.personList.length && value.length === this.personList.length) {
                            this.checked = true;
                        } else {
                            this.checked = false;
                        }
                    },
                    uploadFileList(value) {
                        if (value.length) {
                            this.isHasimg = true;
                        } else {
                            this.isHasimg = false;
                        }
                    },
                },
            })
        }

        /*
         * API to bind global events to the item DOM, it should not be deleted if there will some events to trigger in this widget.
         */
        thisObj.sksBindItemEvent();

        /*
         * API to refresh the previously bound events when a resize or orientation change occurs.
         */
        $(window).resize(function () {
            thisObj.sksRefreshEvents();
        });
    },
});