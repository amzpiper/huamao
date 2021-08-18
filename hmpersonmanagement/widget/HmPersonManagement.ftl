<div id="PersonManagement" v-cloak>
	<div class="personmanagement-container">
		<div class="side-bar">
			<!--  <el-tabs v-model="activeName" type="card" @tab-click="handleClick">  -->
                <!--  <el-tab-pane name="personOrganization" :label="lang.personOrganization">  -->
                    <!--  <span slot="label">
                    <div class="hw-dropdown">
                        <el-dropdown trigger="click" @visible-change='toggleDropdown' @command="showOrganizationTree">
                            <span class="el-dropdown-link">
                                {{lang.personOrganization}}<i class=" "
                                    :class="[{'el-icon-caret-bottom':dropdownClose,'el-icon-caret-top':dropdownOpen},'el-icon--right']"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown" class="orginaztion-menu">
                                <el-dropdown-item v-for="item in organizationRootList" :key="item.id" :command="item">
                                    {{item.organizationName}}</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                        </div>
                    </span>  -->
                    <div class="search-box">
                        <el-input class="search-input" :placeholder="lang.enterKeywords" suffix-icon="el-icon-search"
                            v-model="searchOrganizationWord">
                        </el-input>
                    </div>
                    <div class="person-organization-tree">
                        <div class="tree-wrapper">
                            <el-tree class="el-tree" :data="currentOperatorOrgTree" node-key="id" lazy
                                :default-expanded-keys="defaultExpandOrgTreeKey" highlight-current :load='loadData' 
                                @node-click="selectPersonOrg" :props="{label:'organizationName',isLeaf:'leaf'}" ref="orgTree"
                                :filter-node-method="filterNode" :empty-text="lang.noData" :expand-on-click-node=false > 
                            </el-tree>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>


        
        <div class="main">
            <div class="main-search">
                <el-row>
                    <el-col :span="12">
                        <span class="label">{{lang.name}}</span>
                        <el-input class="main-search-input" :placeholder="lang.enterName"
                            v-model="personName" :label="lang.name" style="width:43%;">
                        </el-input>
                     </el-col>
                    <el-col :span="12" class="main-search-btn"> 
                        <el-button size="medium" class="main-search-query-btn" @click="search" :disabled="isDisabled">{{lang.search}}
                        </el-button>
                        <el-button size="medium" class="main-search-reset-btn btn-two" @click="resetSearch" :disabled="isDisabled">{{lang.reset}}
                        </el-button>
                        </el-button>
                    </el-col>
                </el-row>
            </div>
            <!-- 人员操作按钮组 新增 删除 废弃 批量上传人脸图片 导入 导出 -->
            <!--  <div class="main-btn-group">
                <el-row>
                    <el-col :span="12">
                        <el-button type="primary" icon="el-icon-circle-plus-outline" class="main-add-btn"
                            @click="addPerson" :disabled="notHasModify||isDisabled">{{lang.add}}</el-button>
                        <el-button type="primary" icon="el-icon-delete" class="main-delete-btn"
                            @click="batchDeletePerson" :disabled="notHasModify||isDisabled">{{lang.delete}}</el-button>
                        <el-button type="primary" icon="el-icon-remove" class="main-delete-btn"
                            @click="batchDiscardPerson" :disabled="notHasModify||isDisabled">{{lang.discard}}</el-button>
                    </el-col>
                    <el-col :span="12" class="main-operation-btn-group">
                        <el-button type="primary" icon="el-icon-upload" class="btn-face-upload btn-one"
                            :disabled="notHasModify||isDisabled" @click="locationTo">{{lang.batchFacePhotoUpload}}
                        </el-button>
                        <el-button type="primary" class="btn-import btn-two" :disabled="notHasModify||isDisabled"
                            @click="importPerson"> {{lang.import}}</el-button>
                        <el-button type="primary" class="btn-export btn-two" @click="batchExportPerson"
                            :disabled="isDisabled">{{lang.export}}</el-button>
                    </el-col>
                </el-row>
            </div>  -->
                <!-- hgzz -->
             <div class="main-person-card-list">

                <!--  <div class="card-control">
                    <el-checkbox v-model="checked" class="card-check-box" @change="allSelect"></el-checkbox> |
                    <span>{{lang.selectAll}}</span>
                </div>    -->
                <!-- 人员卡片列表 修改  删除 废弃 查看-->
                <!--  <el-row :gutter="20" class="card-list" v-if="personList.length" >  -->
                    <!--  <el-col :span="4" v-for="(item,index) in personList" :key="index">  -->
                              
                    <div class="hw-table">
                        <el-table
                                :data="personList"
                                style="width: 100%">
                                <el-table-column
                                    prop="personBase.personName"
                                    label="姓名"
                                    width="180">
                                </el-table-column>
                                <el-table-column
                                    prop="personOrganization[0].organizationName"
                                    label="公司"
                                    width="180">
                                </el-table-column>
                                <el-table-column
                                    prop="personBase.gender"
                                    label="性别">
                                </el-table-column>
                                <el-table-column
                                    prop="personBase.personType[0].typeName"
                                    label="人员类型">
                                </el-table-column>
                                <el-table-column
                                    prop="personBase.personLevel"
                                    label="人员级别">
                                </el-table-column>
                                <el-table-column
                                    prop="personBase.region"
                                    label="所属区域">
                                </el-table-column>
                                </el-table>

                    </div>


                        <!--  <el-card :body-style="{ padding: '0px' }" class="card-item">
                            <el-row>
                                <el-col :span="12">
                                    <el-checkbox class="card-check-box" v-model="item.checked"
                                        @change="checked=>handleChange(checked,item.id)"></el-checkbox>
                                </el-col>
                                 
                                <el-col :span="12" class="card-item-btn-box">
                                    <el-button class=" card-edit-btn" @click="editPerson(item.id)" type="text"
                                        :disabled="notHasModify||isDisabled" :title="lang.modifyPerson">
                                        <img :src="iconEdit">
                                    </el-button>
                                    <el-button class=" card-delete-btn" @click="deletePerson(item.id,item.personBase.personType[0].code)" type="text"
                                        :disabled="notHasModify||isDisabled" :title="lang.deletePerson">
                                        <img :src="iconDelete">
                                    </el-button>
                                    <el-button class=" card-delete-btn" @click="discardPerson(item.id,item.personBase.personType[0].code)" type="text"
                                        :disabled="notHasModify||isDisabled" :title="lang.discard">
                                        <i class="el-icon-remove" style="color:#8696B5;"></i>
                                    </el-button>
                                </el-col>
                            </el-row>
                            <div class="face-box" @click="showFacePicture(item)" v-if="!item.profilePhoto">
                                <img :src="noHeadPortrait" style="width:100%;height:100%;"  >
                            </div>
                            <div class="face-box" @click="showFacePicture(item)"  v-else-if="item.profilePhoto&&item['isHideHeadPortrait']">
                                <img :src="defaultHeadPortrait"  style="cursor: pointer;width:100%;height:100%;">
                            </div>
                            <div class="face-box" @click="showFacePicture(item)" v-else-if="item.profilePhoto&&!item['isHideHeadPortrait']">
                                <img :src="item.profilePhoto" style="width:100%;height:100%" >
                            </div>
                            <div class="card-bottom">
                                <div class="card-info">
                                    <p>{{lang.name}}：<span class="info-con">{{item.personBase.personName}}</span></p>
                                    <p>{{lang.gender}}：<span class="info-con">{{item.personBase.gender}}</span></p>
                                    <p>{{lang.personType}}：<span class="info-con">{{item.personBase.personType[0].typeName}}</span></p>
                                </div>
                                <div class="card-opt">
                                    <div class="icon-item" @click="editPerson(item.id,true)">
                                        <i class="el-icon-view"></i>
                                    </div>
                                    <el-tag effect="dark" v-if="item.isDiscard" size="mini">
                                        {{ item.isDiscard }}
                                    </el-tag>
                                </div>
                            </div>
                        </el-card>  -->
                    <!--  </el-col>  -->
                <!--  </el-row>  -->
                <div class="card-list no-data" v-else>
                    {{lang.noDataMatching}}
                </div>
                <div class="card-pagination" v-if="pagination">
                    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                        :current-page="currentPage" :page-sizes="pageSizes" :page-size="pageSize"
                        layout="prev, pager,next,sizes,jumper,total" :total="personTotalSize">
                    </el-pagination>
                </div>
            </div>
        </div>
    </div>
    <!-- 新增修改人员群组弹窗 -->
    <div class="hw-dialog">
        <el-dialog :title="personGroupTitle" :visible.sync="showPersonGroupDialog" width="640px"
            :close-on-click-modal="false">
            <el-form :model="personGroupForm"  ref="groupForm" :rules="personGroupFormRules">
                <el-row>
                    <el-col :span="11">
                        <el-form-item :label="lang.personGroupName"  prop="groupName" >
                            <el-input v-model="personGroupForm.groupName" auto-complete="off" :placeholder="lang.enterGroupName" >
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2" :style="{height:'40px'}"></el-col>
                    <el-col :span="11">
                        <el-form-item :label="lang.personGroupType" prop="groupType">
                            <el-select v-model="personGroupForm.groupType" :placeholder="lang.selectPersonGroupType">
                                <el-option v-for="item in personGroupType" :key="item.value" :label="item.label"
                                    :value="item.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item :label="lang.personGroupDescription" prop="groupDesc">
                    <el-input type="textarea" v-model="personGroupForm.groupDesc" class="person-group-desc" :rows="4"
                        :maxLength="groupDescMaxlength" show-word-limit>
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hidePersonGroupDialog">{{lang.cancel}}</el-button>
                <el-button type="primary" @click="doEditOrAddPersonGroup">{{lang.oK}}</el-button>
            </div>
        </el-dialog>
    </div>
    <!-- 查看人员群组弹窗 -->
    <div class="hw-dialog">
        <el-dialog :title="lang.viewPersonGroup" :visible.sync="showLookGroupDialog" width="640px" :close-on-click-modal="false">
            <el-form :model="personGroupForm">
                <el-form-item>
                    <el-col :span="11">
                        <el-form-item :label="lang.personGroupName">
                            <el-input v-model="personGroupForm.groupName" auto-complete="off" :placeholder="lang.enterGroupName"
                                disabled="true"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2" :style="{height:'40px'}"></el-col>
                    <el-col :span="11">
                        <el-form-item :label="lang.personGroupType">
                            <el-select v-model="personGroupForm.groupType" :placeholder="lang.selectPersonGroupType" disabled="true">
                                <el-option v-for="item in personGroupType" :key="item.value" :label="item.label"
                                    :value="item.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-form-item>
                <el-form-item :label="lang.personGroupDescription" prop="groupDesc">
                    <el-input type="textarea" v-model="personGroupForm.groupDesc" class="person-group-desc" :rows="4"
                        show-word-limitd disabled="true"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showLookGroupDialog=false">{{lang.cancel}}</el-button>
            </div>
        </el-dialog>
    </div>
    <!-- 新增修改人员抽屉 -->
    <div class="hw-drawer">
        <el-drawer :title="drawwerTitle" :visible.sync="showPersonInfoDrawer" size="72rem" @close="colseDrawer"
            :append-to-body=false :wrapperClosable=false :before-close="beforeClose">
            <el-upload ref="faceUpload" action="#" list-type="picture-card" :auto-upload=true
                limit="1" accept="jpg,jpeg,png,bmp" :on-exceed="onExceed" :http-request="uploadFaceImage"
                v-if="!disabled" :disabled="isHasimg"  @click.native="selectImage">
                <i slot="default" class="el-icon-plus"></i>
                <div class="upload-text" style="display: inline-block;line-height: 1;margin-top: 20px;font-size: 12px;color: #fff;">{{lang.uploadImage}}</div>
                <div slot="file" slot-scope="{file}">
                    <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
                    <span class="el-upload-list__item-actions">
                        <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
                            <i class="el-icon-delete"></i>
                        </span>
                    </span>
                    <div class="faceDeact" v-if="file.isSelected">{{lang.faceRecognition}}</div>
                </div>
            </el-upload>
            <div class="avater" v-else-if="uploadFileList.length">
                <el-image :src="uploadFileList[0].url" fit="fill"></el-image>
                <div class="faceDeact" v-if="uploadFileList[0].isSelected">{{lang.faceRecognition}}</div>
            </div>
            <el-form :model="personInfoForm" class="person-info" :rules="personInfoFormRules" ref="personForm">
                <div class="form-box">
                    <el-form-item :label="lang.name" prop="person.personName">
                        <el-input v-model="personInfoForm.person.personName" auto-complete="off" :placeholder="lang.enterName" 
                            :disabled="disabled">
                        </el-input>
                    </el-form-item>
                    <el-form-item :label="lang.gender" prop="person.gender">
                        <el-select v-model="personInfoForm.person.gender" :placeholder="lang.selectGender" :disabled="disabled" >
                            <el-option v-for="item in personGender" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="lang.personType" prop="person.typeCode">
                        <el-select v-model="personInfoForm.person.typeCode" :placeholder="lang.selectPersonType"
                            @change="resetQueryDef" :disabled="isModifyPerson" :disabled="disabled" filterable>
                            <el-option v-for="item in personTypeList" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>

                    </el-form-item>
                </div>
                <div class="form-box">
                    <el-form-item :label="lang.englishName" prop="person.personNameEn">
                        <el-input v-model="personInfoForm.person.personNameEn" auto-complete="off" :placeholder="lang.enterEnglishName"
                            :disabled="disabled"></el-input>
                    </el-form-item>
                    <el-form-item :label="lang.birthday">
                        <div class="hw-date-picker">
                            <el-date-picker v-model="personInfoForm.person.dateOfBirth" type="date" :placeholder="lang.selectBirthday"
                                value-format="yyyy-MM-dd" :disabled="disabled" :picker-options="pickerOptions"
                                v-if="!disabled">
                            </el-date-picker>
                            <el-input v-model="personInfoForm.person.dateOfBirth" auto-complete="off" placeholder=""
                                :disabled="disabled" v-else>
                        </div>
                    </el-form-item>
                    <el-form-item :label="lang.personGroup">
                        <el-select v-model="personInfoForm.person.personGroup" :placeholder="lang.selectPersonGroup" multiple
                            :multiple-limit="maxPersonGroup" :disabled="disabled" v-if="!disabled" class="select-group" filterable >
                            <el-option v-for="item in allPersonGroup" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>
                        <el-select v-model="personInfoForm.person.personGroup" placeholder="" multiple
                            :multiple-limit="maxPersonGroup" :disabled="disabled" v-else>
                            <el-option v-for="item in allPersonGroup" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="person-attr" v-if="hideAtribute">
                    <el-form-item v-for="(item,index) in personAttrList" :key="item.id" :label="item.label"
                        :rules="item.rules" :prop="'personAttribute['+index+'].attributeValue'"
                        :class="[((index+1) % 3)=== 0 ? 'no-maigin' : '']">
                        <el-input v-if="item.type === 'String'" :disabled="disabled"
                            v-model="personInfoForm.personAttribute[index].attributeValue"
                            :placeholder="item.placeholder"></el-input>
                        <el-input v-else-if="item.type === 'Number'" :disabled="disabled" type="number"
                            v-model="personInfoForm.personAttribute[index].attributeValue||0"
                            :placeholder="item.placeholder" class="number-input"></el-input>
                        <div  class="portalUserStyle"  v-else-if="(item.type === 'Enumeration' && item.code === 'portalUser')"  >
                            <el-select ref="remoteSelect"
                            filterable remote
                                clearable :remote-method="portalUserRemoteMethod"
                                v-model="personInfoForm.personAttribute[index].attributeValue"
                                :placeholder="item.placeholder" :disabled="disabled || portalUserDiasabled" class="select-portal" @change="portalUserChange">
                                <el-option v-for="data in item.options" :label="data.label" :value="data.value"
                                    :key="data.id"></el-option>
                            </el-select>
                            <!--  创建用户 v-if="showCreatOperatorBut"-->
                            <div class="createOperatorFlagStyle">
                            <el-checkbox  :disabled="createOperatorFlagDiasabled || disabled" v-if="hasPortalUser && hasCreateOperatorPermission" v-model="personInfoForm.operatorInfo.createOperatorFlag" >{{lang.createUser}}</el-checkbox>
                            </div>
                        </div>
                        <el-select v-else-if="item.type==='Enumeration'" :disabled="disabled"
                            v-model="personInfoForm.personAttribute[index].attributeValue"
                            clearable
                            :placeholder="item.placeholder">
                            <el-option v-for="data in item.options" :label="data.label" :value="data.value"
                                :key="data.id"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
               
                <div class="person-other-attr">
                    <div v-if="hasPortalUser && hasCreateOperatorPermission  && personInfoForm.operatorInfo.createOperatorFlag && isConfigPassword">
                        <div class="add-identity-btn info-btn">
                            <div class="identity-title"  style="float: left; margin-top: 3px;"> 
                                {{lang.createPassword.label}}
                            </div>
                        </div>
                         <el-form :model="operatorPasswordFrom" :rules="operatorPasswordRules" ref="operatorPasswordFrom">
                            <div class="form-box">
                                <el-form-item :label="lang.createPassword.psw.label" prop="password">
                                   <el-tooltip  effect="dark" placement="right" visible-arrow>
                                        <div slot="content">
                                            <p>{{lang.createPassword.ruleInfo.label}}</p>
                                            <div style="width: 100%;">
                                                <p v-if="userSetRule.psw_minLen || userSetRule.psw_maxLen">
                                                    <span v-if="userSetRule.psw_minLen">{{stringReplaceWithParam(lang.createPassword.ruleInfo.minLen, userSetRule.psw_minLen)}}</span>
                                                    <span v-if="userSetRule.psw_minLen && userSetRule.psw_maxLen && lang.language === 'zh_CN'">、</span>
                                                    <span v-if="userSetRule.psw_maxLen">{{stringReplaceWithParam(lang.createPassword.ruleInfo.maxLen,userSetRule.psw_maxLen)}}</span>
                                                </p>
                                                <p v-if="userSetRule.psw_UpLett || userSetRule.psw_LowLett || userSetRule.psw_Num || userSetRule.psw_SpecCharc">
                                                    <span>{{lang.createPassword.ruleInfo.atLeast}}</span>
                                                    <span v-if="lang.language === 'en-US'">&nbsp</span>
                                                    <span v-if="userSetRule.psw_UpLett">{{lang.createPassword.ruleInfo.uppercase}}</span>
                                                    <span v-if="userSetRule.psw_UpLett && userSetRule.psw_LowLett && lang.language === 'zh_CN'">、</span>
                                                    <span v-if="userSetRule.psw_LowLett">{{lang.createPassword.ruleInfo.lowercase}}</span>
                                                    <span v-if="(userSetRule.psw_UpLett || userSetRule.psw_LowLett) && userSetRule.psw_Num && lang.language === 'zh_CN'">、</span>
                                                    <span v-if="userSetRule.psw_Num">{{lang.createPassword.ruleInfo.digit}}</span>
                                                    <span v-if="(userSetRule.psw_UpLett || userSetRule.psw_LowLett || userSetRule.psw_Num) && userSetRule.psw_SpecCharc && lang.language === 'zh_CN'">、</span>
                                                    <span v-if="userSetRule.psw_SpecCharc">{{lang.createPassword.ruleInfo.specChar}}</span>
                                                </p>
                                                </div>
                                            </div>
                                    <el-input v-model="operatorPasswordFrom.password" auto-complete="off" type="password"  :placeholder="lang.createPassword.psw.placeholder"></el-input>
                                </el-tooltip>
                                </el-form-item>
                                <el-form-item :label="lang.createPassword.rePsw.label" prop="repeatPassword">
                                    <el-input v-model="operatorPasswordFrom.repeatPassword" auto-complete="off" type="password" :placeholder="lang.createPassword.rePsw.placeholder"></el-input>
                                </el-form-item> 
                            </div>
                        </el-form> 
                    </div>

                    <div class="person-identity-info">
                        <div class="add-identity-btn info-btn">
                            <div class="identity-title"  style="float: left; margin-top: 3px;"> 
                                 {{lang.personCertificate}}
                            </div>
                            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addPersonIdentitys"
                                :disabled="addIdentityDisable" v-if="!disabled">{{lang.addCertificate}}</el-button>
                        </div>
                        <div class="hw-table">
                            <el-table :data="personInfoForm.personIdentity" style="width: 100%;" v-show="personInfoForm.personIdentity.length">
                                <el-table-column :label="lang.certificateType">
                                    <template slot-scope="scope">
                                        <el-select v-model="scope.row.identityType" :placeholder="lang.selectCertificateType"
                                            :disabled="disabled" @visible-change="fileterIdentityType">
                                            <el-option v-for="item in typeList" :key="item.value"
                                                :label="item.label" :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="lang.certificateNo">
                                    <template slot-scope="scope">
                                        <el-input v-model="scope.row.proofValue" :disabled="disabled"  :placeholder="lang.enterCertificateNo"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="lang.operation" width="120px" style="text-algin:center;">
                                    <template slot-scope="scope">
                                        <el-button type="text" icon="el-icon-delete" size="large"
                                            @click="handleDeleteIdentity(scope.$index, scope.row)" v-if="!disabled">
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <div class="person-license-info">
                        <div class="add-license-btn info-btn">
                            <div class="identity-title"  style="float: left; margin-top: 3px;">
                                 {{lang.personVehicle}}
                            </div>
                            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addPersonLicense"
                                v-if="!disabled" :disabled="addLicenseDisable">{{lang.addVehicle}}
                            </el-button>
                        </div>
                        <div class="hw-table">
                            <el-table :data="personInfoForm.personVehicle" style="width:100%;" v-show="personInfoForm.personVehicle.length">
                                <el-table-column :label="lang.licensePlateNumber">
                                    <template slot-scope="scope">
                                        <el-input v-model.trim="scope.row.licensePlateNumber" :placeholder="lang.enterLicensePlateNumber"
                                            :disabled="disabled" >
                                        </el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="lang.description">
                                    <template slot-scope="scope">
                                        <el-input v-model="scope.row.vehicleDesc" :placeholder="lang.enterVehicleDescription"
                                            :disabled="disabled"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="lang.operation" width="120px" style="text-algin:center;" class="cl-table">
                                    <template slot-scope="scope">
                                        <el-button type="text" icon="el-icon-delete" size="large"
                                            @click="handleDeletelicense(scope.$index, scope.row)" v-if="!disabled">
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <div class="person-organization-info">
                        <div class="add-organization-btn info-btn">
                            <div class="identity-title" style="float: left; margin-top: 3px;">
                                {{lang.personOrganization}}
                            </div>
                            <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addPersonOrgnization"
                                v-if="!disabled" :disabled="addOrganizationDisable">
                                {{lang.associatedOrganizations}}</el-button>
                        </div>
                        <div class="hw-table">
                            <el-table :data="personInfoForm.personOrganization" style="width: 100%;" v-show="personInfoForm.personOrganization.length" >
                                <el-table-column :label="lang.organizationName">
                                    <template slot-scope="scope">
                                        <el-cascader :placeholder="lang.selectOrganizationRoot" popper-class='person_region'
                                            v-model="scope.row.organizationId" :options="organizations"
                                            :props="orgProps" clearable
                                            @change="((value)=>{selectOrg(value, scope.$index)})" :disabled="disabled">
                                        </el-cascader>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="lang.organizationCode">
                                    <template slot-scope="scope">
                                        <div v-if="!disabled">{{scope.row.organizationCode}}</div>
                                        <div v-else style="color:rgba(146,151,182,0.5);">{{scope.row.organizationCode}}
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="lang.organizationDescription">
                                    <template slot-scope="scope">
                                        <div v-if="!disabled" style="color:#9297b6;"> {{scope.row.organizationDesc}}
                                        </div>
                                        <div v-else style="color:rgba(146,151,182,0.5);">{{scope.row.organizationDesc}}
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="lang.operation" width="120px" style="text-algin:center;" class="org-table">
                                    <template slot-scope="scope">
                                        <el-button type="text" icon="el-icon-delete" size="large"
                                            @click="handleDeleteOrganization(scope.$index, scope.row)" v-if="!disabled">
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                </div>
            </el-form>
            <div class="add-person-info-btn">
                <el-button @click="colseDrawer" class="cancel">{{lang.cancel}}</el-button>
                <el-button type="primary" @click="handlePersonData" v-if="!disabled">{{lang.save}}</el-button>
            </div>
        </el-drawer>
    </div>
</div>