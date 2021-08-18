<div id="login-container" class="login-container" v-show="notAutoLogin" v-cloak>
	<div class="pic-list">
		<img class="login-img" :src="bg1" alt="">
      <img class="login-img" :src="bg2" alt="">
      <img class="login-img" :src="bg3" alt="">
   </div>

   <div class="bottomGradient"> </div>
   <div class="login-bg">
      <div class="login-box">
         <img :src="logo" alt="login-logo" class="login-box__logo">
         <span class="login-box__title">
            {{systemTitle}}
         </span>
         <div v-if="loginOrPass == 'login'" style="width:100%">
            <el-form class="loginForm" :model="ruleForm" status-icon :rules="rules" ref="loginForm" label-width="0px">
               <el-form-item class="passDiv" prop="userName">
                  <input class="login-box__account" v-model="ruleForm.userName" :placeholder="lang.enterUsername" autocomplete="off"
                     @keyup.enter="login('loginForm')" />
                  <div class="hw-input-xt"></div>
               </el-form-item>
               <el-form-item class="passDiv" prop="password">
                  <input class="login-box__password" type="password" v-model="ruleForm.password" :placeholder="lang.enterPassword"
                    autocomplete="off" @keyup.enter="login('loginForm')" oncopy="return false" oncut="return false" />
                  <div class="hw-input-xt"></div>
               </el-form-item>
               <el-form-item v-if="needCaptcha" class="passDiv" prop="captcha">
                  <div> <input class="login-box__captcha" v-model="ruleForm.captcha" :placeholder="lang.enterTheVerificationCode"
                        @keyup.enter="login('loginForm')"></input>
                     <img :src="imgCode" alt="login-captcha" :title="lang.clickToRefreshTheVerificationCode" @click="getVerifyCode"
                        class="login-box__captchaImg"></img>
                  </div>
                  <div class="hw-input-xt"></div>
               </el-form-item>
               <el-button type="primary" class="login-box__button" @click="login('loginForm')">
                  {{lang.logIn}}
               </el-button>
            </el-form>
            <div id="login-thirdLogin" class="login-box__agreement" style="justify-content:center;position: relative;">
					<div class="thirdLintTitle">
						<span class="third-forget" style="cursor: pointer;" @click="forgetPassword()">{{lang.forgetPassword}}</span>
					</div>
				</div>
            <div id="login-thirdLogin" v-if="oauthInfoList.length" class="login-box__agreement" style="justify-content:center;position: relative;">
				   <div class="thirdLintTitle">
					   <i class="line-left"></i>
					   <span class="third-tips">{{lang.thirdPartyLogin}}</span>
					   <i class="line-right rotateImg"></i>
				   </div>
            </div>
            <div v-if="oauthInfoList.length" class="login-box__agreement" style="justify-content:center;margin-top:0.5rem;">
               <ul style="padding: 0;margin: 0;">
                  <li v-for="item in oauthInfoList" class="thirdImage">               
                     <img :src="item.logo" :alt="item.accountType" style="width:3.5rem;height:3.5rem;cursor:pointer;" :title="item.accountType" @click="goOauthValidate(item.accountType)">
                  </li>
               </ul>
            </div>
            <div class="login-box__agreement" style="justify-content:center;margin-top:0.2rem;">
               <span class="login-thirdStatement" style="margin-top: 0.5rem;"><a @click="viewPrivacy()" style="margin-left:0">{{privacyTitle}}</a></span>
            </div>
         </div>
         <div v-if="loginOrPass == 'password'" style="width:100%">
            <div class="userInfo-pswrule"
               v-if="userSetRule.psw_lenStr || userSetRule.psw_ruleStr || userSetRule.psw_RepeatCharts">
               <p>{{lang.toEnsureInformationSecurity}}：</p>
               <div style="width: 100%; padding-left: 15px;">
                  <p v-if="userSetRule.psw_lenStr">
                     {{userSetRule.psw_lenStr}}
                  </p>
                  <p v-if="userSetRule.psw_ruleStr">
                     {{userSetRule.psw_ruleStr}}
                  </p>
                  <p v-if="userSetRule.psw_RepeatCharts">
                     {{lang.thePasswordMustBeAtLeast}} {{userSetRule.psw_RepeatCharts}} {{lang.charactersThatCannotBeRepeated}}
                  </p>
               </div>
            </div>
            <div class="userInfo-item" :class="{error: dataErr.oriPsw}">
               <input v-model="acct.oriPsw" @input="onInput('oriPsw')" type="password" :placeholder="lang.enterTheOldPassword"
                  autocomplete="off" @keyup.enter="handleUserset('save')" oncopy="return false" oncut="return false"></input>
               <div class="hw-input-xt"></div>
               <label class="error-msg" v-show="dataErr.oriPsw">{{dataErrDesc.oriPsw}}</label>
            </div>
            <div class="userInfo-item" :class="{error: dataErr.psw}">
               <input v-model="acct.psw" @blur="onBlur('psw', acct.psw)" @input="onInput('psw')" type="password"
                  autocomplete="off" :placeholder="lang.enterANewPassword" @keyup.enter="handleUserset('save')" oncopy="return false" oncut="return false"></input>
               <div class="hw-input-xt"></div>
               <label class="error-msg" v-show="dataErr.psw">{{dataErrDesc.psw}}</label>
            </div>
            <div class="userInfo-item" :class="{error: dataErr.rePsw}">
               <input v-model="acct.rePsw" @blur="onBlur('rePsw', acct.rePsw)" @input="onInput('rePsw')" type="password"
                  autocomplete="off" :placeholder="lang.enterTheNewPasswordAgain" @keyup.enter="handleUserset('save')" oncopy="return false" oncut="return false"></input>
               <div class="hw-input-xt"></div>
               <label class="error-msg" v-show="dataErr.rePsw">{{dataErrDesc.rePsw}}</label>
            </div>
            <div class="userInfo-item">
               <div class="btn-wrap">
                  <el-button class="userInfo-item__cancelButton" @click="handleUserset('cancel')">{{lang.cancel}}
                  </el-button>
                  <el-button type="primary" class="userInfo-item__okButton" @click="handleUserset('save')">{{lang.ok}}
                  </el-button>
               </div>
            </div>
         </div>
      </div>
   </div>
   <el-dialog width="20%" :visible.sync="dialogVisible" :close-on-click-modal="dialogAutoClose"
      :close-on-press-escape="false" class="hw-ok-check" center>
      <div class="hw-icon-circle-check">
         <img :src="messageBoxImg" alt="">
         <p>{{descInfo}}</p>
         <a v-if="canSkip" @click="afterLogin" style="cursor: pointer;font-size:0.875rem"> {{lang.notProcessed}},</a>
         <span>
            {{lang.goNow}}<a @click="changePassword" style="cursor: pointer;"> {{lang.modified}}</a>
         </span>
      </div>
   </el-dialog>
   <el-dialog :visible.sync="promtDialogVisible" width="20%" :modal-append-to-body="false"
      :close-on-press-escape="false" class="hw-ok-check" center>
      <div class="hw-icon-circle-check">
         <img :src="messageBoxImg" alt="">
         <div style="margin-top:15px;">
            <el-checkbox  v-model="isAgreePrivacyStatement" @changeAgree="changeAgree()">{{lang.iHaveReadAndAgree}}</el-checkbox>
            <a @click="viewPrivacy()" style="color:#ff8b00;cursor:pointer;word-break:keep-all;">{{privacyTitle}}</a>
         </div>
      </div>
      <span slot="footer" class="dialog-footer private">
         <el-button @click="cancelAgree()" class="userInfo-item__cancelButton">{{lang.cancel2}}</el-button>
         <el-button type="primary" @click="sign()" class="userInfo-item__okButton">{{lang.ok}}</el-button>
      </span>
   </el-dialog>
   <el-dialog :visible.sync="bindDialogVisible" width="30%" :modal-append-to-body="false"
      :close-on-press-escape="false" class="hw-ok-check" center>
      <div>
         <div style="margin: 1rem 4.5rem;">
            <p style="margin-left: 5px;">{{lang.user}}{{thirdPartyLoginAccount}}{{lang.bindText}}</p>
             <el-form class="loginForm" :model="bindForm" status-icon :rules="rules" ref="bindForm" label-width="0px">
               <el-form-item class="passDiv" prop="password">
                  <input class="login-box__password" type="password" v-model="bindForm.password" :placeholder="lang.enterPassword"
                    autocomplete="off" oncopy="return false" oncut="return false"/>
                  <div class="hw-input-xt"></div>
               </el-form-item>
               <el-form-item v-if="needCaptcha" class="passDiv" prop="captcha">
                  <div> 
                     <input class="login-box__captcha" v-model="bindForm.captcha" :placeholder="lang.enterTheVerificationCode"></input>
                     <img :src="imgCode" alt="login-captcha" :title="lang.clickToRefreshTheVerificationCode" @click="getVerifyCode"
                        class="login-box__captchaImg"></img>
                  </div>
                  <div class="hw-input-xt"></div>
               </el-form-item>
            </el-form>
         </div>
      </div>
      <span slot="footer" class="dialog-footer private">
         <el-button @click="cancelBind()" class="userInfo-item__cancelButton" style="margin-bottom: 1.5rem;">{{lang.cancel2}}</el-button>
         <el-button type="primary" @click="bind('bindForm')" class="userInfo-item__okButton"  style="margin-bottom: 1.5rem;">{{lang.bind}}</el-button>
      </span>
   </el-dialog>
   <!--浏览器兼容popup-->
   <el-dialog width="25%" :visible.sync="broswerShow" :close-on-click-modal="false" :show-close="false" :close-on-hash-change = "false"
      :close-on-press-escape="false" class="hw-ok-check" center>
      <div class="hw-icon-circle-check"><img :src="messageBoxImg" alt="">
         <p style="letter-spacing: 1;">{{lang.tips}}</p>
         <span style="letter-spacing: 1;">
               {{lang.ifGoogleChromeIsNotInstalled}} <a href="https://www.google.cn/intl/zh-CN/chrome/" target="_blank" rel="noopener noreferrer" style="cursor: pointer;">{{lang.goToDownload}}</a>
         </span>
      </div>
   </el-dialog>   
</div>