<div id="unified-portal" class="preload">
	<div class="up-container flex-col" v-show="identityId != '' && noRedirect" v-cloak>
		<!--header-->
		<div class="up-top flex-row" v-show="!fullScreen">
			<div class="top-left">
				<div class="top-logo flex-row" v-show="sysParams.logoUrl">
					<lable style="color: white;font-size: 20;font-weight: 600;">华贸智慧园区平台</lable>
                </div>
            </div>
            <div class="top-right flex-row">
                <span class="top-item pr-2" v-if="showArea">
                    <div class="top-item-dropdown ioc-el-dropdown el-dropdown" @mouseenter="LocContVisible = true;"
                        @mouseleave="LocContVisible = false;">
                        <span>
                            <!--已选择title-->
                            <span class="el-dropdown-link">
                                {{selAreaTitle}}<i class="el-icon-arrow-down el-icon--right"></i>
                            </span>
                        </span>
                        <transition name="sc-slide-fade">
                            <div class="nav__project-choose" v-show="LocContVisible">

                                <!--已选择区域-->
                                <ul class="nav__project-choose__tab">
                                    <template v-if="selArea.length !== 0">
                                        <li class="nav__project-choose__tab__item" v-for="(item, index) in selArea"
                                            @click="showLevelList(item, index)">{{item.spaceName}}</li>
                                    </template>
                                </ul>
                                <div class="nav__project__btn">
                                    <div v-if="switchAreaItem"
                                        class="nav__project__btn_common nav__project__btn_confirm"
                                        @click="handleLoc('confirm')" :title="lang.handoverArea"></div>
                                    <div class="nav__project__btn_common nav__project__btn_reset"
                                        @click="handleLoc('reset')" :title="lang.reset"></div>
                                </div>

                                <!--待选择区域-->
                                <div class="nav__project-choose__list">
                                    <div class="nav__project-choose__list__item" v-for="item in unSelArea" :class="{grey: !item.canSwitch}"
                                        @click="addArea(item)">{{item.spaceName}}</div>
                                    <div class="nav__project-choose__list__item" v-if="unSelArea.length == 0">
                                        {{lang.noData}}</div>
                                </div>
                            </div>
                        </transition>
                    </div>
                </span>
                <span class="top-item pr-2" v-if="sysParams.alarmConf && alarmConList.length > 0">
                    <el-badge :value="alarmCount" class="item ioc-alarm" :max="999">
                        <el-popover trigger="hover" :visible-arrow="false" popper-class="hw-popover">
                        <!--告警设置-->
                        <div class="popover-content" v-show="!showAlarmSound">
                            <div class="msg-switch">
                                <p>
                                    <span class="uni-pop__icon">
                                        <i class="alarm-type"></i>
                                        <span>{{lang.message.alarmType}}</span>
                                    </span>
                                    <span class="uni-pop__icon">
                                        <i class="msg"></i>             
                                        <span>{{lang.messageSwitch}}</span>
                                    </span>                
                                </p>
                            </div>
                            <div v-for="(item, idx) in alarmConList" :key="idx" class="alarm-ins">
                                <span class="alarm-item">
                                    <div class="alarm-icon" @click="goToFramePage(item.code)">
                                        <img :src="item.icon" alt="">
                                        <el-badge :value= "item.count" class="item ioc-alarm" :max="999"></el-badge>
                                    </div>
                                    <span>{{item.name}}</span>
                                </span>
                                <el-switch v-model="alarmStorage[item.type]" :validate-event="false"></el-switch>
                            </div>
                            <div class="msg-switch">
                                <p class="alarm-sound" @click="showAlarmSound = true;" style="cursor: pointer;">
                                    {{lang.message.alarmSound}} >         
                                </p>
                            </div>                            
                        </div>  
                        <!--声音设置-->
                        <div class="popover-content" v-show="showAlarmSound">
                            <div class="msg-switch">
                                <p>
                                    <span class="uni-pop__icon">
                                        <i class="sound"></i>
                                        <span>{{lang.message.alarmSound}}</span>
                                    </span>               
                                </p>
                            </div>
                            <div class="alarm-ins">
                                <span class="alarm-item" style="position: relative;">
                                    <div class="alarm-icon sound" style="background: #E66965;"></div>
                                    <span>{{lang.major}}</span>
                                </span>
                                <el-switch v-model="alarmStorage.critical" :validate-event="false"></el-switch>
                            </div>
                            <div class="alarm-ins">
                                <span class="alarm-item" style="position: relative;">
                                    <div class="alarm-icon sound" style="background:#EEAF76;"></div>
                                    <span>{{lang.importance}}</span>
                                </span>
                                <el-switch v-model="alarmStorage.major" :validate-event="false"></el-switch>
                            </div>
                            <div class="alarm-ins">
                                <span class="alarm-item" style="position: relative;">
                                    <div class="alarm-icon sound" style="background:#407AEE;"></div>
                                    <span>{{lang.common}}</span>
                                </span>
                                <el-switch v-model="alarmStorage.normal" :validate-event="false"></el-switch>
                            </div>
                            <div class="alarm-ins">
                                <span class="alarm-item" style="position: relative;">
                                    <div class="alarm-icon sound" style="background:#66D1B5;"></div>
                                    <span>{{lang.information}}</span>
                                </span>
                                <el-switch v-model="alarmStorage.info" :validate-event="false"></el-switch>
                            </div>                                                                                    
                            <div class="msg-switch">
                                <p class="alarm-sound" @click="showAlarmSound = false;" style="cursor: pointer;">
                                    {{lang.message.alarmConf}} >         
                                </p>
                            </div>                            
                        </div>  
                        <span class="el-dropdown-link" slot="reference">
                            {{lang.alarm}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                    </el-badge>
                </span>
                <span class="top-item pr-2" v-if="sysParams.multiLangConf">
                    <el-dropdown @command="toggleLang" class="ioc-el-dropdown">
                        <span class="el-dropdown-link">
                            {{locale.selLocale}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown" class="ioc-el-dropdown-menu">
                            <el-dropdown-item :command="locale.noSelLang">{{locale.noSelLocale}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </span>
                <span class="top-item">
                    <el-dropdown @command="userSet" class="ioc-el-dropdown">
                        <span class="el-dropdown-link">
                            {{userName}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown" class="ioc-el-dropdown-menu">
                            <el-dropdown-item command="user">{{lang.user_settings}}</el-dropdown-item>
                            <el-dropdown-item command="about">{{lang.about.title}}</el-dropdown-item>
                            <el-dropdown-item command="logout">{{lang.exit}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </span>
                <span class="top-item" v-show="userPic">
                    <img class="user-head" :src="userPic" alt="userPic">
                </span>
            </div>
        </div>

        <!--body-->
        <div class="up-body" :class="{fullHeight: fullScreen}">
            <!--left navigation +iframe-->
            <div class="main-frame__content" v-if="showContent">
                <!--left menu-->
                <div class="body-left" v-show="!fullScreen">
                    <!--root-->
                    <div class="left-scrollTop" @click.prevent="menuScroll('top')" v-show="showMenuScroll">
                        <img :src="upArrow" alt="">
                    </div>
                    <div class="left-wrap">
                        <div class="dropdown" v-for="(menuItem, idx) in menuList" :key="idx" @mouseenter="hoverMenu(idx, true, $event)" @mouseleave="hoverMenu(idx, false,$event)" @click.stop="toggleFrame(menuItem, idx);" :class="{'click': clicIdx == idx}">
                            <div class="menu__main flex-col">
                                <img :src="menuItem.imageList[1]" alt="" v-show="menuItem.imageList[1] && (hoverIdx == idx || clicIdx == idx)">
                                <img :src="menuItem.imageList[0]" alt="" v-show="!(menuItem.imageList[1] && (hoverIdx == idx || clicIdx == idx))">
                                <span class="single-overflow__ellipsis" :title="menuItem.label">{{menuItem.label}}</span>
                            </div>
                            <div class="activeBlur" v-show="clicIdx == idx"></div>
                            <!--sub menu 2级-->
                            <transition name="fade">
                                <ul class="menu__sub" v-show="hoverIdx == idx">
                                    <li class="sub-dropdown" v-for="(sub_MenuItem, sub_idx) in menuItem.subMenu" :key="sub_idx" @mouseenter="hoverSubMenu(sub_idx, true)" @mouseleave="hoverSubMenu(sub_idx, false)" @click.stop="toggleFrame(sub_MenuItem, idx, sub_idx);" :class="{'click': clicSubIdx == sub_idx && clicIdx == idx}">
                                        <span class="single-overflow__ellipsis" :title="sub_MenuItem.label">{{sub_MenuItem.label}}</span>
                                        <i class="icon-arrow__right" v-show="sub_MenuItem.subMenu.length > 0"></i>
                                        <!--sub2 menu 3级-->
                                        <transition name="fade">
                                            <ul class="menu__sub-sub" v-show="hoverSubIdx == sub_idx">
                                                <li v-for="(sub2_MenuItem, sub2_idx) in sub_MenuItem.subMenu" :key="sub2_idx" @mouseenter="hoverSub2Menu(sub2_idx, true)" @mouseleave="hoverSub2Menu(sub2_idx, false)" @click.stop="toggleFrame(sub2_MenuItem, idx, sub_idx, sub2_idx);" :class="{'click': clicSub2Idx == sub2_idx && clicSubIdx == sub_idx}">
                                                    <span class="single-overflow__ellipsis" :title="sub2_MenuItem.label">{{sub2_MenuItem.label}}</span>
                                                    <i class="icon-arrow__right" v-show="sub2_MenuItem.subMenu.length > 0"></i>
                                                    <!--sub3 menu 4级-->
                                                    <transition name="fade">
                                                        <ul class="menu__sub-sub menu__sub-sub-sub" v-show="hoverSub2Idx == sub2_idx">
                                                            <li v-for="(sub3_MenuItem, sub3_idx) in sub2_MenuItem.subMenu" :key="sub3_idx"  @click.stop="toggleFrame(sub3_MenuItem, idx, sub_idx, sub2_idx, sub3_idx);" :class="{'click': clicSub3Idx == sub3_idx && clicSub2Idx == sub2_idx && clicSubIdx == sub_idx}">
                                                                <span class="single-overflow__ellipsis" :title="sub3_MenuItem.label">{{sub3_MenuItem.label}}</span>
                                                            </li>
                                                        </ul>
                                                    </transition>
                                                </li>
                                            </ul>
                                        </transition>
                                    </li>
                                </ul>
                            </transition>
                        </div>
                    </div>
                    <div class="left-scrollBottom" @click.prevent="menuScroll('bottom')" v-show="showMenuScroll">
                        <img :src="downArrow" alt="">
                    </div>
                </div>
                <!--right content-->
                <div class="body-right">
                    <iframe v-show="showIframe" id="ScFrame" ref="ref_iframe" :src="iframeSrc" frameborder="0"
                        allowtransparent="true" @load="loadIframe" :class="contentWrap" name=""></iframe>
                    <div v-show="isIframeThird && contentWrap == 'content-wrap'" id="LoadDiv" align="center" class="mod-load-all">
                        <img :src="loadImg" />
                    </div>
                    <div v-show="!showIframe && !isOpenNewTab" id="LoadDiv" align="center" class="mod-load">
                        <img :src="loadImg" />
                    </div>
                    <div v-show="!showIframe && isOpenNewTab" id="LoadDiv" align="center" class="mod-load">
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkE4NjA4RTM4NTgwMTFFOTg5QjNDQTI2QzJCQ0U0Q0UiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkE4NjA4RTQ4NTgwMTFFOTg5QjNDQTI2QzJCQ0U0Q0UiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCQTg2MDhFMTg1ODAxMUU5ODlCM0NBMjZDMkJDRTRDRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCQTg2MDhFMjg1ODAxMUU5ODlCM0NBMjZDMkJDRTRDRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnSq+/MAAAqNSURBVHja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" />
                        <span style="color:#fff;font-size:1.5rem">{{lang.message.openNewTab}}</span>
                    </div>
                    <!--full screen or not-->
                    <div class="toggle-fullscreen">
                        <img :src="fullScreenIcon" alt="" @click.prevent="toggleFullScreen">
                    </div>
                </div>
            </div>
            <!--user set-->
            <transition name="fade">
                <div class="main-frame__personal flex-col" v-if="showPersonal">
                    <div class="user-title">
                        <span>{{lang.userSetting.title}}</span>
                        <div class="back" @click="handleBack()">{{lang.userSetting.basicInfo.back}}</div>
                    </div>
                    <div class="user-tab">
                        <div class="userInfo userInfo-left">
                            <div class="userInfo-head" @mouseenter="userPicEdit = true;" @mouseleave="userPicEdit = false;">
                                <img :src="acct.userPic" alt="" v-show="acct.userPic">
                                <span class="edit-head" v-show="userPicEdit">
                                    <i class="el-icon-edit-outline"></i>
                                    <input type="file" ref="inputImg" @change.stop="editUserPic" accept="image/jpg, image/jpeg, image/gif, image/png">
                                </span>
                            </div>
                            <div class="userInfo-item" :class="{error: dataErr.name}">
                                <div class="acctName" v-if="viewName">
                                    <span>{{acct.name}}</span>
                                    <i class="el-icon-edit-outline" slot="suffix" @click="viewName = false;"></i>
                                </div>
                                <el-input :placeholder="lang.userSetting.basicInfo.name.placeholder" v-model="acct.name" maxlength=32 @input="onInput('name')" v-else>
                                    <i class="el-icon-check" slot="suffix" @click="handleUserset('save','basicInfo')"></i>
                                    <i class="el-icon-close" slot="suffix" @click="handleUserset('cancel')"></i>
                                </el-input>
                                <label class="error-msg" v-show="dataErr.name">{{dataErrDesc.name}}</label>
                            </div>
                        </div>
                        <div class="userInfo userInfo-right">
                            <div class="main-item flex space-between">
                                <div class="item-phone"></div>
                                <div class="item-label font-normal">
                                    {{lang.userSetting.basicInfo.acctAndSafe.bindPhone}}
                                    <span class="font-small">
                                        <span v-if="safeAcctInit.email"> {{phoneBindMsg}}</span>
                                        <span v-else style="color: #ff8b00;"> {{phoneBindMsg}}</span>
                                        <span class="font-phone">{{safeAcctInit.phone}}</span>
                                        <span v-else>
                                            <span class="item-divide">|</span>
                                            <span class="item-status unset">{{lang.userSetting.basicInfo.acctAndSafe.noSet}}</span>
                                        </span>
                                        <span v-if="safeAcctInit.phone">
                                            <span v-if="safeAcctInit.phoneIsCertified == false">
                                                <span class="item-divide">|</span>
                                                <span class="item-status unset">({{lang.userSetting.basicInfo.acctAndSafe.noCertify}})</span>
                                            </span>
                                        </span>
                                    </span>
                                </div>
                                <div class="item-last">
                                    <div v-if="safeAcctInit.phone && safeAcctInit.phoneIsCertified == false" class="item-setup text-clickable" @click="safeAcctSet('goInit', 'phone', 'certify')">{{lang.userSetting.basicInfo.acctAndSafe.certify}}</div>
                                    <div class="item-setup text-clickable" @click="safeAcctSet('goInit', 'phone', 'addOrUp')">
                                        <span v-if="safeAcctInit.phone">{{lang.userSetting.basicInfo.acctAndSafe.modify}}</span>
                                        <span v-else>{{lang.userSetting.basicInfo.acctAndSafe.bindPhone}}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="main-item flex space-between">
                                <div class="item-email"></div>
                                <div class="item-label font-normal">
                                    {{lang.userSetting.basicInfo.acctAndSafe.bindEmail}}
                                    <span class="font-small">
                                        <span v-if="safeAcctInit.email"> {{emailBindMsg}}</span>
                                        <span v-else style="color: #ff8b00;"> {{emailBindMsg}}</span>
                                        <span class="font-phone">{{safeAcctInit.email}}</span>
                                        <span v-else>
                                            <span class="item-divide">|</span>
                                            <span class="item-status unset">{{lang.userSetting.basicInfo.acctAndSafe.noSet}}</span>
                                        </span>
                                        <span v-if="safeAcctInit.email">
                                            <span v-if="safeAcctInit.emailIsCertified == false">
                                                <span class="item-divide">|</span>
                                                <span class="item-status unset">({{lang.userSetting.basicInfo.acctAndSafe.noCertify}})</span>
                                            </span>
                                        </span>
                                    </span>
                                </div>
                                <div class="item-last">
                                    <div v-if="safeAcctInit.email && safeAcctInit.emailIsCertified == false" class="item-setup text-clickable" @click="safeAcctSet('goInit', 'email', 'certify')">{{lang.userSetting.basicInfo.acctAndSafe.certify}}</div>
                                    <div class="item-setup text-clickable" @click="safeAcctSet('goInit', 'email', 'addOrUp')">
                                        <span v-if="safeAcctInit.email">{{lang.userSetting.basicInfo.acctAndSafe.modify}}</span>
                                        <span v-else>{{lang.userSetting.basicInfo.acctAndSafe.bindEmail}}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="main-item flex space-between">
                                <div class="item-password"></div>
                                <div class="item-label font-normal">
                                    {{lang.userSetting.basicInfo.acctAndSafe.psw}}
                                    <span class="font-small">
                                        {{lang.userSetting.basicInfo.acctAndSafe.hasBeenSet}}：******</span>
                                    <span class="font-small">
                                        {{lang.userSetting.basicInfo.acctAndSafe.pswWarn}}&nbsp;</span>
                                </div>
                                <div class="item-last">
                                    <div class="item-setup text-clickable" @click="modiCurPsw('goInit')">
                                        <span>{{lang.userSetting.basicInfo.acctAndSafe.modify}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>

            <!--drawer-->
            <el-drawer :title="drawerTitle" :visible.sync="drawer.show" :direction="drawer.direction"
                :before-close="handleClose" :append-to-body=false size="50rem">
                <!--phone+email-->
                <div class="drawer-wrap" v-show="drawer.drawerType == 'modiPhOrEm'">
                    <el-steps :active="drawer.activeIndex" align-center finish-status="success" v-if="drawer.scenario == 'addOrUp'">
                        <el-step :title="lang.userSetting.basicInfo.drawer.authentication"></el-step>
                        <el-step :title="lang.userSetting.basicInfo.drawer.entryInfo"></el-step>
                        <el-step :title="lang.userSetting.basicInfo.drawer.complete"></el-step>
                    </el-steps>
                    <el-steps :active="drawer.activeIndex" align-center finish-status="success" v-else>
                        <el-step :title="lang.userSetting.basicInfo.drawer.authentication"></el-step>
                        <el-step :title="lang.userSetting.basicInfo.drawer.complete"></el-step>
                    </el-steps>

                    <div>
                        <!--psw 身份验证-->
                        <div id="verify" class="drawer-body flex-column" v-if="drawer.currStep == 'verify_psw'">
                            <div class="safe-tips"> {{lang.userSetting.basicInfo.drawer.authenTip}}</div>
                            <!--psw-->
                            <el-form ref="input_phOrEm" :model="input_phOrEm" :rules="safeAcctVerifyRule" @submit.native.prevent>
                                <el-form-item :label="lang.userSetting.basicInfo.drawer.psw" prop="psw">
                                    <div class="userInfo-item">
                                        <el-input @keyup.enter.native="safeAcctSet('goVerify', 'psw')"
                                            v-model="input_phOrEm.psw" type="password"
                                            :placeholder="lang.userSetting.basicInfo.drawer.pswInput" maxlength=32
                                            clearable>
                                        </el-input>
                                    </div>
                                </el-form-item>
                            </el-form>
                            <div class="userInfo-item">
                                <div class="btn-wrap">
                                    <button class="btn-common btn-cancel"
                                        @click.prevent="safeAcctSet('goCancel', 'closeDrawer')">{{lang.button.cancel}}</button>
                                    <button class="btn-common btn-deault"
                                        @click.prevent="safeAcctSet('goVerify', 'psw')">{{lang.button.ok}}</button>
                                </div>
                            </div>
                        </div>

                        <!--phone+email 身份验证-->
                        <div id="inputData" class="drawer-body flex-column" v-if="drawer.currStep == 'verify_phOrem'">
                            <div class="safe-tips"> {{lang.userSetting.basicInfo.drawer.authenTip}}</div>
                            <div class="userInfo-item" v-if="drawer.verifyType == 'phone'">
                                <div class="safe-normal">
                                    <span
                                        class="des">{{lang.userSetting.basicInfo.drawer.BoundPhone}}：&nbsp;&nbsp;</span>
                                    <span>{{safeAcctInit.phone}}</span>
                                    <a @click.prevent="drawer.verifyType = 'email';"
                                        v-if="safeAcctInit.email && safeAcctInit.emailIsCertified && drawer.scenario == 'addOrUp'">
                                        {{lang.userSetting.basicInfo.drawer.otherAuthenWay}}
                                    </a>
                                </div>
                            </div>
                            <div class="userInfo-item" v-if="drawer.verifyType == 'email'">
                                <div class="safe-normal">
                                    <span
                                        class="des">{{lang.userSetting.basicInfo.drawer.BoundEmail}}：&nbsp;&nbsp;</span>
                                    <span>{{safeAcctInit.email}}</span>
                                    <a @click.prevent="drawer.verifyType = 'phone';"
                                        v-if="safeAcctInit.phone && safeAcctInit.phoneIsCertified && drawer.scenario == 'addOrUp'">
                                        {{lang.userSetting.basicInfo.drawer.otherAuthenWay}}
                                    </a>
                                </div>
                            </div>

                            <!--Image Code-->
                            <el-form ref="input_phOrEm" :model="input_phOrEm" :rules="safeAcctVerifyRule" @submit.native.prevent>
                                <el-form-item prop="imageVfCode">
                                    <div class="userInfo-item">
                                        <div class="item-input flex">
                                            <el-input @keyup.enter.native = "safeAcctSet('goVerify', 'phOrem')" :placeholder="lang.userSetting.basicInfo.drawer.imgCodeInput"
                                                v-model="input_phOrEm.imageVfCode" maxlength=32 clearable> </el-input>
                                            <div class="safeacct-box__captchaImg">
                                                <img :src="drawer.imgCode" alt=""
                                                    :title="lang.userSetting.basicInfo.drawer.imgCodeRefresh"
                                                    @click="getImgVerifyCode"></img>
                                            </div>
                                        </div>
                                    </div>
                                </el-form-item>
    
                                <!--Verify Code-->
                                <el-form-item prop="verifyCode">
                                    <div class="userInfo-item">
                                        <div class="item-input flex">
                                            <el-input @keyup.enter.native = "safeAcctSet('goVerify', 'phOrem')" :placeholder="lang.userSetting.basicInfo.drawer.verifyCodeInput"
                                                v-model="input_phOrEm.verifyCode" maxlength=32 clearable> </el-input>
                                            <div>
                                                <div class="btn-common btn-deault btn-verify"
                                                    :class="{'active': input_phOrEm.verifyCodeGet}"
                                                    @click.prevent="getVerifyCode(drawer.verifyType)">{{input_phOrEm.verifyCodeMsg}}</div>
                                            </div>
                                        </div>
                                    </div>
                                </el-form-item>
                            </el-form>
                            <div class="userInfo-item">
                                <div class="btn-wrap">
                                    <button class="btn-common btn-cancel"
                                        @click.prevent="safeAcctSet('goCancel', 'closeDrawer')">{{lang.button.cancel}}</button>
                                    <button class="btn-common btn-deault" :class="{'isDisabled': isDisabled}"
                                        @click.prevent="safeAcctSet('goVerify', 'phOrem')" :disabled="isDisabled">{{lang.button.ok}}</button>
                                </div>
                            </div>
                        </div>

                        <!--录入-->
                        <div id="inputData" class="drawer-body flex-column" v-if="drawer.currStep == 'input'">
                            <div class="userInfo-item" v-if="drawer.verifyBy == 'phOrem'">
                                <div class="safe-normal" v-if="drawer.targetType == 'phone' && safeAcctInit.phone">
                                    <span
                                        class="des">{{lang.userSetting.basicInfo.drawer.BoundPhone}}：&nbsp;&nbsp;</span>
                                    <span>{{safeAcctInit.phone}}</span>
                                </div>
                                <div class="safe-normal" v-if="drawer.targetType == 'email' && safeAcctInit.email">
                                    <span
                                        class="des">{{lang.userSetting.basicInfo.drawer.BoundEmail}}：&nbsp;&nbsp;</span>
                                    <span>{{safeAcctInit.email}}</span>
                                </div>
                            </div>
                            <el-form ref="input_phOrEm" :model="input_phOrEm" :rules="safeAcctVerifyRule" @submit.native.prevent>
                                <!--Image Code-->
                                <el-form-item :label="lang.userSetting.basicInfo.drawer.imgCode" prop="imageVfCode"
                                    v-if="drawer.verifyBy == 'psw'">
                                    <div class="userInfo-item">
                                        <div class="item-input flex">
                                            <el-input @keyup.enter.native= "safeAcctSet('goComplete', drawer.targetType)" :placeholder="lang.userSetting.basicInfo.drawer.imgCodeInput"
                                                v-model="input_phOrEm.imageVfCode" maxlength=32 clearable> </el-input>
                                            <div class="safeacct-box__captchaImg">
                                                <img :src="drawer.imgCode" alt=""
                                                    :title="lang.userSetting.basicInfo.drawer.imgCodeRefresh"
                                                    @click="getImgVerifyCode"></img>
                                            </div>
                                        </div>
                                    </div>
                                </el-form-item>

                                <!--phone-->
                                <el-form-item :label="lang.userSetting.basicInfo.drawer.newPhone" prop="phone"
                                    v-if="drawer.targetType == 'phone'">
                                    <div class="userInfo-item">
                                        <el-input @keyup.enter.native= "safeAcctSet('goComplete', drawer.targetType)" v-model="input_phOrEm.phone"
                                            :placeholder="lang.userSetting.basicInfo.drawer.newPhoneInput" maxlength=32
                                            clearable>
                                        </el-input>
                                    </div>
                                </el-form-item>

                                <!--email-->
                                <el-form-item :label="lang.userSetting.basicInfo.drawer.newEmail" prop="email"
                                    v-if="drawer.targetType == 'email'">
                                    <div class="userInfo-item">
                                        <el-input @keyup.enter.native= "safeAcctSet('goComplete', drawer.targetType)" v-model="input_phOrEm.email"
                                            :placeholder="lang.userSetting.basicInfo.drawer.newEmailInput" maxlength=32
                                            clearable>
                                        </el-input>
                                    </div>
                                </el-form-item>

                                <!--Verify Code-->
                                <el-form-item :label="lang.userSetting.basicInfo.drawer.verifyCode" prop="verifyCode">
                                    <div class="userInfo-item">
                                        <div class="item-input flex">
                                            <el-input @keyup.enter.native= "safeAcctSet('goComplete', drawer.targetType)" v-model="input_phOrEm.verifyCode"
                                                :placeholder="lang.userSetting.basicInfo.drawer.verifyCodeInput"
                                                maxlength=32 clearable> </el-input>
                                            <div>
                                                <div class="btn-common btn-deault btn-verify"
                                                    :class="{'active': input_phOrEm.verifyCodeGet}"
                                                    @click.prevent="verifyPhoneOrEmailExist(drawer.targetType)">{{input_phOrEm.verifyCodeMsg}}</div>
                                            </div>
                                        </div>
                                    </div>
                                </el-form-item>
                            </el-form>
                            <div class="userInfo-item">
                                <div class="btn-wrap">
                                    <button class="btn-common btn-cancel"
                                        @click.prevent="safeAcctSet('goCancel', 'closeDrawer')">{{lang.button.cancel}}</button>
                                    <button class="btn-common btn-deault" :class="{'isDisabled': isDisabled}"
                                        @click.prevent="safeAcctSet('goComplete', drawer.targetType)" :disabled="isDisabled">{{lang.button.ok}}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--完成-->
                    <div id="success" class="drawer-body flex-column" v-if="drawer.currStep == 'complete'">
                        <div>
                            <div class="safe_success"></div>
                        </div>
                        <div class="safe_success-tip">
                            <span>{{drawerTitle}}{{lang.userSetting.basicInfo.drawer.complete}}</span>
                        </div>
                    </div>
                </div>
                <!--psw-->
                <div class="drawer-wrap" v-show="drawer.drawerType == 'modiPsw'">
                    <div class="userInfo flex-column__center">
                        <div class="userInfo-pswrule"
                            v-if="userSetRule.psw_minLen || userSetRule.psw_maxLen ||userSetRule.psw_UpLett || userSetRule.psw_LowLett || userSetRule.psw_Num || userSetRule.psw_SpecCharc">
                            <p>{{lang.userSetting.passwordChange.rule.label}}</p>
                            <div style="width: 100%;" class="psw-wrap">
                                <p v-if="userSetRule.psw_minLen || userSetRule.psw_maxLen">
                                    <span
                                        v-if="userSetRule.psw_minLen">{{stringReplaceWithParam(lang.userSetting.passwordChange.rule.minLen, userSetRule.psw_minLen)}}</span>
                                    <span
                                        v-if="userSetRule.psw_minLen && userSetRule.psw_maxLen && lang.language === 'zh_CN'">、</span>
                                    <span
                                        v-if="userSetRule.psw_maxLen">{{stringReplaceWithParam(lang.userSetting.passwordChange.rule.maxLen,userSetRule.psw_maxLen)}}</span>
                                </p>
                                <p
                                    v-if="userSetRule.psw_UpLett || userSetRule.psw_LowLett || userSetRule.psw_Num || userSetRule.psw_SpecCharc">
                                    <span>{{lang.userSetting.passwordChange.rule.atLeast}}</span>
                                    <span v-if="lang.language === 'en-US'">&nbsp</span>
                                    <span
                                        v-if="userSetRule.psw_UpLett">{{lang.userSetting.passwordChange.rule.uppercase}}</span>
                                    <span
                                        v-if="userSetRule.psw_UpLett && userSetRule.psw_LowLett && lang.language === 'zh_CN'">、</span>
                                    <span
                                        v-if="userSetRule.psw_LowLett">{{lang.userSetting.passwordChange.rule.lowercase}}</span>
                                    <span
                                        v-if="(userSetRule.psw_UpLett || userSetRule.psw_LowLett) && userSetRule.psw_Num && lang.language === 'zh_CN'">、</span>
                                    <span
                                        v-if="userSetRule.psw_Num">{{lang.userSetting.passwordChange.rule.digit}}</span>
                                    <span
                                        v-if="(userSetRule.psw_UpLett || userSetRule.psw_LowLett || userSetRule.psw_Num) && userSetRule.psw_SpecCharc && lang.language === 'zh_CN'">、</span>
                                    <span
                                        v-if="userSetRule.psw_SpecCharc">{{lang.userSetting.passwordChange.rule.specChar}}</span>
                                </p>
                                <p v-if="userSetRule.psw_RepeatCharts">
                                    {{stringReplaceWithParam(lang.userSetting.passwordChange.rule.comparePsw,userSetRule.psw_RepeatCharts)}}
                                </p>
                            </div>
                        </div>
                        <div class="userInfo-item" :class="{error: dataErr.oriPsw}">
                            <label>{{lang.userSetting.passwordChange.oriPsw.label}}</label>
                            <el-input v-model="acct.oriPsw" @input="onInput('oriPsw')" type="password"
                                auto-complete="new-password" clearable></el-input>
                            <label class="error-msg" v-show="dataErr.oriPsw">{{dataErrDesc.oriPsw}}</label>
                        </div>
                        <div class="userInfo-item" :class="{error: dataErr.psw}">
                            <label>{{lang.userSetting.passwordChange.psw.label}}</label>
                            <el-input placeholder="" v-model="acct.psw" @blur="onBlur('psw', acct.psw)"
                                @input="onInput('psw')" type="password" auto-complete="new-password" clearable>
                            </el-input>
                            <label class="error-msg" v-show="dataErr.psw">{{dataErrDesc.psw}}</label>
                        </div>
                        <div class="userInfo-item" :class="{error: dataErr.rePsw}">
                            <label>{{lang.userSetting.passwordChange.rePsw.label}}</label>
                            <el-input placeholder="" v-model="acct.rePsw" @blur="onBlur('rePsw', acct.rePsw)"
                                @input="onInput('rePsw')" type="password" auto-complete="new-password" clearable>
                            </el-input>
                            <label class="error-msg" v-show="dataErr.rePsw">{{dataErrDesc.rePsw}}</label>
                        </div>
                        <div class="userInfo-item">
                            <div class="btn-wrap">
                                <button id="cancelPassword" class="btn-common btn-cancel"
                                    @click.prevent="modiCurPsw('goCancel')">{{lang.button.cancel}}</button>
                                <button id="savePassword" class="btn-common btn-deault"
                                    @click.prevent="modiCurPsw('goSave')">{{lang.button.save}}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </el-drawer>
        </div>

        <!--dialog-->
        <el-dialog width="30%" :visible.sync="dialog.dialogVisible" :close-on-click-modal="dialog.dialogAutoClose"
            :close-on-press-escape="false" class="hw-ok-check" center :before-close="redictLogin">
            <div class="hw-icon-circle-check">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkI2QUFDMDI4NTdFMTFFOTg5QjNDQTI2QzJCQ0U0Q0UiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkI2QUFDMDM4NTdFMTFFOTg5QjNDQTI2QzJCQ0U0Q0UiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGQjZBQUMwMDg1N0UxMUU5ODlCM0NBMjZDMkJDRTRDRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGQjZBQUMwMTg1N0UxMUU5ODlCM0NBMjZDMkJDRTRDRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Po/splsAAAqXSURBVHja5JtbbJxHFcdnP68d310nsV0nTVIaIUhTIQGtUCk0QGmhTy0GxEXioZQHEA8FIagEJQJ6UZF4aBGiINHwUrUS0MsDSClBhdIL4lKQWpK0qoBCLk6c2o7jtXd92V3OyL/Dnh1/3v1293PqiE/6d93ZzTfnPmfOnMmUy2X3//xk/X/e97V1e38GRII285kx8E/ZoCgomU8dXz8BrAPTymi7oMOgHWT5jRWAZ3ZZsAQWDZYCgWw4Aag2lelO0C3oApsQQraOAJZhekGQB/OCAlBhpGIZ2ZQYz8KcZ7RH0Cfo5W//+VbB2wQ7BRcLNvPbTt5TgNEpwSnBfwQvCl4W5ARzfM7ydx4hLbcqiGyLzCvj3TA9AAYFV/vwItjL97UetRj/73YLrhF8Cs0fFvxO8AfBtGAGzPK9FcR5EYD6eDta7INwr9Xtgo8IrmdcnzOCVwT/EhwXnBSchQGHgC4SbBNcIrgUqxkSXAU8w4cEjwtOYC3TjOdxjYZjRLYJ5tvw516I3grhnxTciFAcTD4reAaTLuDXS2isaIjV92YR7CYsYofgWsF7mGOMOQ4KHmGO1xFmjvcXGxFCtgmT9wz2C7YIRgTvF9yKthwm67X0F+OzGsQWEwqgAwGcFhwVPCy4Euvay6cXyoOC3/LbScE5rCGxS2QbYF5N3pv7MNr5guADfO9N+4Dgz2jknDHPBZgvrrG+h/mCXU26sDbP4B9xh1uY/3b+/wGsJotbqEuU0xCAMt+Nn3utXy74uuAypP2o4BdobArm5xpYtnS8yO9VIHPMPYNQNQi+JPiY4KOC66DjbsERhDiF1dUVQrYBs/eaHxW8XfAtXMBr5X7BnwQThvmQ8UafcpAbLKLVnMFPcbfbBG8SfBe6/hZkljXdIZsg4HUS7Pz6/Q7Bd/j/15D6q0bzc80EogTCWDbWsWgSJC/occE3WDnuFOxHcIp8LXqiGhNH+NUAPr9H8E2Y94HpDkzuGAKYSRiAbP6g679miJkEgsgz12nmPgItR6HN0/gWaO6Hh6gWk7X8vgdT347PDxnN/4P1+HVMchGJJw2mA7x7C3938V2mzjtKzJVj7hPQcje0DSGQ7SzRvbw3SiqA0O+9JD9PhuYTmntIaMZNxE267LQZq/LxZBcYZWwTv0nqFnloGIeme6BxNzQPYxVdZheaSAAdZHJbWeZuwP/uI6M71QTzOl8nq4lPan4FxhjrrOOWtYRwCtrug1ZP8wfhoQ+e6gpAtd+N9n329VnGNbmZaJJ5na8Ds7wN7VzE3718FzURIFUIp6HxMWj+HK4wCE+r4kxUQ/ub2ZAMk+T8DPPSNXY5xUifSWGVmEcInsafQ7Pn4dN8xlpBFOOjmur6TcmHGT9g1vm5pFlWnQD2faL5NLlE0kC6lhCWoG0KWg/w3Q3wMmBiQWweYCO/N8ub+QeHSW81yVlokkgVQIF3+ezxScZzjBVafPcCNE5B82H2DjezZE4jpP9ZbxQToHR7ez3jj5ncvkBS0exThMgZIve/wThjCym8vwCtZ6HdwcsgvFUF2mxg/p0Eo6v5sV9jX4C4Vkw/NFXVVmS0V0ohg7SuMAPtJwnm72al6MTiitYC7Ianh0qOf55jR5dLQfth0Fo0db7FFIOqWoGW0J5lfB+8dduEK4rJ0LrxG/88zYvyKWj/fD1qBXks4feM70UAVRlnNsj7O9nqdmM6x8ymIw3t654/MpXhcMOTRulbrWAeHs6QIu+BL90flCLj/x18cQVjrwal6HJKAtCVRmsLI+wHmkmE6lmB0n+U8StMeb4ttAAtRV3C2D8JVAsp+mdkBDBEoG2DyDNGe8UU48wCK42jitRhN0ehANpJHR2ms2SitkvRAjzjD5lY44jSSyYotvqUDP3HGBs1fEY2CNpa3GbGJgK/TPNpizH12EytRQHoSdM4Y1sMn1G4CugXeogxk9LaHOeb3iy/KvhicDiSVgzQudSdphnrMXyuWgYVelw1F9TWXIpmuWBWF2sVbS1ujOLqimXmcgTAqpPpyJ3fx67RWty0wlmvJ2sCbGw9wEqrYMwlPMdPyyw1Qi/GlMbTeizt6tYFk3aXQwGov+h5Xb9JWjLuwntsXOurJ4CSEcAUYyOu+iz/QnsiQ//FjE256tOpKgHomnnCJA3ttSqqG/xpM/TvYGw8zG3iBHCcscuImpsS1Ow3qvlrer9rreQuMtFRt6cvM/ZmVzm4aD9PAsikFHg141T69zD+iqs+qK2yABXAYZapbZiOtrK0rTPz9lhcra7ZvECLO93sbYbg6e+u0l5TClcBPXOb5YdaROh1yU9tWnm04WKQFairSdeztY0eeHAoNmcEsGoZ1NLyHIUQ/1zjKg1P62EFlrktROt9WF5Pk0K3pb0+eAiLO7FF0WVTSnoeS/A7w3eyUelJ0QrKMZmfN9PPCH7oVk6gu5pwAVtvGID27fDyXCAAFwpAS9azbB4OMT6GafanaAV21XHG3a7ju+dddQ9ho9rvh+Yxxg/BU84FpfeoRkX1CaTl9+xXsk2ue9zcYMlK5/LPuyDsBxDcaKFUy3r90HoVtOfhZQYBVFW3ohjC9Pzd5wMHGfdNUMO8OA1X0JTbZ2b3ox1fy/cHm/4M8qxrrAwflto8rbfw3a/hRfsXinG7JBesBrMQ9whBxC8lH3crx03zJpFotlSmAvDn+49CZAarmHaVHsIk7w8PdIegdQc8PMznrI3+tQRgDxpPwvTt+NOLrrr/J9+kEPSE6BxETcLIUlCILSVkXnsZRgh8Y9D0E1L76bUEml0jQqsVeA095VYaoz4k+BLFyyVjSs0Iod4JUalJ5n1rzJdxB3/u+Bt4iNX+WgWR8Mzd1wZ/5FbaULx5aXvcKBM3m7DUOiFqlPlRaNI2Hk/rj6H9rKvRKBXV0dCcq/Th3IX2L3UrXVm7XXUfTpr1vHrRXpsstkLDblfpFJuE1uP8navlTlGdtVr9dIKNxJ1IdA+TXE6wGTFV3fXaOVqtDzDnDmi4C5p8pP82tE64yolzqZY065WvCjDtT1b/6lba0CaR9r1upZl5p7EGPYJOSxDKuB7dq9Z3Mve9RvN3QONpaC7Uq2pnE/pp3pSWS6wKGgv2u0qrbK9rrlV2rW2x7RnuMUmO1762ynoe/CmW7xA74ipNm4mCc7aBiD3vqttXv+JWmqV988En3MrJjm9f1WbpGZN7qyCWg5pcXLO0lrLCZukB0lvbLF0mh3iAOHXGrUOztBVC2dQPfcT+HiZ3KwTtZ9vpOzNecK23y2u/Qp9Z3/U4zTP7IMv0BC4wwzypt8uH7lAyScsvEYLvKLsRAveSRD0DjrnVFybsWh9q3l6YeC/YZiq7B8nwWr4wkfEXJxu8N1jryown+Ca3+srMBKW21zDVU2jLXpnppx5gr8wMm3fMktg8gUDfkCszdnWwrqCVJK8Jfz3mIWLCPqxhGFzb4Fx6aepptsgb4tJU6BLaxm6FMImWn3TV1+Z2oeVBfLvD7AvmXaUL3FvKS271tblcUNZ6Q6/NOTO5+vWC2ePbi5Mnqchoc4IeT2cCq7LHZhfExclQEKUYQSS9Ols01hRenV02gXNDXp2NixE2PiS9PG13ghfs5elalrHhnv8KMADNvzn58QtNxgAAAABJRU5ErkJggg=="
                    alt="">
                <template v-if="lang.language === 'en-US'">
                    <p>{{dialog.descInfo}}</p>
                    <span>IOC login page is displayed <em>5</em> seconds later, go to <a @click="redictLogin"
                            style="cursor: pointer;">IOC login page</a> now.</span>
                </template>
                <template v-else-if="lang.language === 'zh-CN'">
                    <p>{{dialog.descInfo}}</p>
                    <span>页面<em>5</em>秒后会自动跳转到IOC登录页，立即前往<a @click="redictLogin"
                            style="cursor: pointer;">IOC登录页</a></span>
                </template>
            </div>
        </el-dialog>

        <!--about-->
        <el-dialog width="33.3%" :visible.sync="about.visible" center class="hw-ok-check" :title="lang.about.title">
            <div class="proj-icon" v-show="sysParams.logoUrl">
                <img :src="sysParams.logoUrl" alt="">
            </div>
            <div class="ioc-version" v-if="about.overAllPackObj.versionNumber || about.overAllPackObj.packageName">
                <p>{{about.overAllPackObj.packageName}} {{about.overAllPackObj.versionNumber}}
                    {{about.overAllPackObj.lastModifiedDate}}</p>
            </div>
            <div class="hw-table table">
                <el-table :data="about.packList" style="width: 100%" max-height="350" v-loading="about.loading">
                    <el-table-column property="packageName" :label="lang.about.package"></el-table-column>
                    <el-table-column property="versionNumber" :label="lang.about.version"></el-table-column>
                    <el-table-column property="lastModifiedDate" :label="lang.about.lastModifiedDate"></el-table-column>
                </el-table>
            </div>
            <div class="copy-right" v-show="sysParams.copyRight">
                <span>{{sysParams.copyRight}}</span>
            </div>
        </el-dialog>

        <!--告警声-->
        <audio id="buttonAudio" :src="alarmMusic.src" loop="loop" v-if="sysParams.alarmConf"></audio>
    </div>
</div>