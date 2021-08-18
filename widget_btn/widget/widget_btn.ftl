<div id="widget_btn" v-show="isShow" v-cloak>
    <el-row>
        <button v-for="item in apartFloors"
                @click="btnClick(item.value)"
                :class="{'btnClicked':clickBtn === item.value}"
                class="myButton">
            {{item.label}}
        </button>
        <el-button @click="btnClick(40)"
                   class="rButton"
                   type="success"
                   plain
                   icon="el-icon-refresh"
                   style="width: 7.5rem;">
        </el-button>
    </el-row>

    <!-- 查看传感器指标 -->
    <el-dialog
            id="deviceInfo"
            :title="deviceEnvSensorDialog.envSensor.basic.name"
            :visible.sync="deviceEnvSensorDialog.dialog"
            style="left: 40rem;top: 30rem"
            :modal-append-to-body=true
            :append-to-body=true
            :close-on-click-modal="false"
            width="25%" class="hw-dialog en-dialog">
        <div>
            <li v-for="item in deviceEnvSensorDialog.envSensor.attrs" class="myLi">
                <span :class="item.class">{{item.name}}:{{item.value}}</span>
            </li>
            <div class="flashTime-box">{{deviceEnvSensorDialog.envSensor.basic.flashtime}}</div>
        </div>
    </el-dialog>

    <!-- 查看企业信息 -->
    <div v-if="venderDialog.dialog"
         id="newSpace"
         style="left: 115rem;top: 50rem;z-index: 1303;">
        <div class="newSpace newSpaceMaskCss">
            <div class="wrap">
                <div class="wrapper">
                    <!-- 弹框标题Title -->
                    <div :draggable="true" @dragstart="dragstart" @dragend="dragend" class="newSpace-title">
                        <span>商户信息</span>
                        <span class="el-icon-close close-btn-right-top" @click="venderDialog.dialog = false"></span>
                    </div>

                    <!-- 弹框内容Content -->
                    <div class="newSpace-content">
                        <div>
                            <!-- 企业名称 -->
                            <span class="ntable-title">{{venderDialog.vender.organizationName}}</span>

                            <!-- 类型，等级，所属产业 -->
                            <div class="row2">
                                <span v-if="venderDialog.vender.attrObj.comType" class="text-primary">
                                        {{venderDialog.vender.attrObj.comType}}
                                </span>
                                <span v-if="venderDialog.vender.attrObj.comLevel" class="text-primary">
                                        {{venderDialog.vender.attrObj.comLevel}}
                                </span>
                                <span v-if="venderDialog.vender.attrObj.industry" class="text-primary">
                                        {{venderDialog.vender.attrObj.industry}}
                                </span>
                            </div>

                            <div class="relate-info">
                                <div class="divBottom">
                                        <span class="f">客户编码
                                            <span class="val">{{venderDialog.vender.attrObj.custCode}}</span>
                                        </span>
                                    <span class="f">成立日期
                                            <span class="val">{{venderDialog.vender.attrObj.establishDate}}</span>
                                        </span>
                                </div>
                                <div class="divBottom">
                                        <span class="f">电子邮箱<i class="el-icon-message" style="color: #67C23A"></i>:
                                            <span class="val">{{venderDialog.vender.attrObj.email}}</span>
                                        </span>
                                </div>
                                <div class="divBottom">
                                        <span class="f">统一社会信用代码
                                                <span class="val">{{venderDialog.vender.attrObj.creditCode}}</span>
                                        </span>
                                </div>
                                <div class="divBottom">
                                        <span class="f">所属区域
                                            <span class="val">{{venderDialog.vender.attrObj.region}}</span>
                                        </span>
                                </div>
                                <div class="divBottom">
                                        <span class="f">注册地址
                                            <span class="val">{{venderDialog.vender.attrObj.registeredAddr}}</span>
                                        </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>