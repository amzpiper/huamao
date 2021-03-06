<div id="DeviceManage" v-cloak>
    <div class="switch-buttonList manage-left" @click="isShowDeviceManage=!isShowDeviceManage"
         v-show="isShowDeviceManage">
        <i class="el-icon-arrow-left"></i>
    </div>
    <div class="switch-buttonList manage-right" @click="isShowDeviceManage=!isShowDeviceManage"
         v-show="!isShowDeviceManage">
        <i class="el-icon-arrow-right"></i>
    </div>
    <transition name="fade" mode="in-out" appear>
        <div v-show="isShowDeviceManage" class="deviceManage-area">
            <div v-if="!Studio.inReader" class="titleArea">
                <span>{{lang.deviceManage.titleArea.facilityManagement}}</span>
                <span>/</span>
                <span>{{lang.deviceManage.titleArea.facilityInformationManagement}}</span>
            </div>
            <div class="countArea">
                <span>{{lang.deviceManage.countArea.total}}：{{deviceStatus.total}}
                    {{lang.deviceManage.countArea.station}}</span>
                <div>
                    <div>
                        <div>
                            <span>{{lang.deviceManage.countArea.activated}}</span>
                            <span>{{deviceStatus.active.count}} {{lang.deviceManage.countArea.station}}</span>
                        </div>
                        <span class="device-active">{{deviceStatus.active.percent}}%</span>
                    </div>
                    <div>
                        <div>
                            <span>{{lang.deviceManage.countArea.terminated}}</span>
                            <span>{{deviceStatus.inactive.count}} {{lang.deviceManage.countArea.station}}</span>
                        </div>
                        <span class="device-inactive">{{deviceStatus.inactive.percent}}%</span>
                    </div>
                    <div>
                        <div>
                            <span>{{lang.deviceManage.countArea.obsolete}}</span>
                            <span>{{deviceStatus.deleted.count}} {{lang.deviceManage.countArea.station}}</span>
                        </div>
                        <span class="device-deleted">{{deviceStatus.deleted.percent}}%</span>
                    </div>
                </div>
            </div>
            <div class="conditionArea">
                <el-form :model="condition" class="forms">
                    <el-row :gutter="10" class="deviceName deviceConditionSelect">
                        <el-col :span="12">
                            <div class="hw-input hw-input__small hw-input__padding">
                                <el-input v-model="condition.externalCode"
                                          :placeholder="lang.deviceManage.conditionArea.externalCode"
                                          @keyup.enter.native='queryDeviceByCondition'
                                          @blur="condition.externalCode=condition.externalCode.replace(/^\s+|\s+$/g,'')"
                                          @clear="queryDeviceByCondition" clearable>
                                    <i slot="prefix" class="el-input__icon el-icon-search"
                                       @click="queryDeviceByCondition"></i>
                                </el-input>
                            </div>
                        </el-col>
                        <el-col :span="12">
                            <div class="hw-input hw-input__small hw-input__padding ">
                                <el-input v-model="condition.deviceName"
                                          :placeholder="lang.deviceManage.conditionArea.deviceName"
                                          @keyup.enter.native='queryDeviceByCondition'
                                          @blur="condition.deviceName=condition.deviceName.replace(/^\s+|\s+$/g,'')"
                                          @clear="queryDeviceByCondition" clearable>
                                    <i slot="prefix" class="el-input__icon el-icon-search"
                                       @click="queryDeviceByCondition"></i>
                                </el-input>
                            </div>
                        </el-col>
                    </el-row>
                    <el-row :gutter="10" class="deviceConditionSelect">
                        <el-col :span="12" class="flex spaceOption">
                            <div class="hw-input hw-input__small" v-if="!currentSpace.id">
                                <el-input v-model="condition.spaceInPathLabel"
                                          :placeholder="lang.deviceManage.conditionArea.spaceInPathLabel" clearable
                                          :title="condition.spaceInPathLabel" @focus="openSpaceDialog('condition')"
                                          @clear="queryDeviceByCondition('space')">
                                </el-input>
                            </div>
                            <div v-else class="hw-cascader cascader-one" @mouseenter="cascaderTitle('cascader-one')">
                                <el-cascader :options="spaceOptions" placeholder="" :props="props"
                                             v-model="condition.spacePathList" @change="selectSpaceNode"
                                             @expand-change="cascaderNodeAddTitleSpace"></el-cascader>
                            </div>
                        </el-col>
                        <el-col :span="6">
                            <div class="hw-input hw-input__small" v-show="false">
                                <el-input v-model="condition.defIdLabel"
                                          :placeholder="lang.deviceManage.conditionArea.defIdLabel" clearable
                                          :title="condition.defIdLabel"
                                          @focus="deviceDef.conditionDialog=true;openDeviceDefDialog()"
                                          @clear="queryDeviceByCondition('deviceDef')">
                                </el-input>
                            </div>
                            <div class="hw-cascader cascader-one cascader_multiple"
                                 @mouseenter="cascaderTitle('cascader-one')">
                                <el-cascader :options="deviceDefOptions" :props="{ multiple: true }"
                                             :placeholder="lang.deviceManage.conditionArea.defIdLabel"
                                             v-model="condition.defIdLabelList" @change="selectdefIdLabelNode"
                                             @expand-change="cascaderNodeAddTitle" clearable collapse-tags
                                             filterable></el-cascader>
                            </div>
                        </el-col>
                        <el-col :span="6">
                            <div class="hw-select hw-select--small">
                                <el-select v-model="condition.status"
                                           :placeholder="lang.deviceManage.conditionArea.status" clearable
                                           @change="queryDeviceByCondition" class="flex">
                                    <el-option :label="lang.deviceManage.conditionArea.active" value="ACTIVE">
                                    </el-option>
                                    <el-option :label="lang.deviceManage.conditionArea.inactive" value="INACTIVE">
                                    </el-option>
                                    <el-option :label="lang.deviceManage.conditionArea.deleted" value="DELETED">
                                    </el-option>
                                </el-select>
                            </div>
                        </el-col>
                    </el-row>
                    <transition name="fade" mode="out-in" appear>
                        <el-row :gutter="10" class="deviceConditionSelect" v-show="showSeparate">
                            <el-col :span="12">
                                <div class="hw-select hw-select--small">
                                    <el-select v-model="condition.channel"
                                               :placeholder="lang.deviceManage.tableArea.channelCode" clearable
                                               @change="queryDeviceByCondition" class="flex">
                                        <el-option v-for="item in device.deviceChannels" :key="item.id"
                                                   :label="item.code" :value="item.id">
                                            <span style="float: left">{{ item.code }}</span>
                                            <span
                                                    style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
                                        </el-option>
                                    </el-select>
                                </div>
                            </el-col>
                            <el-col :span="12">
                                <div class="hw-input hw-input__small">
                                    <el-input v-model="condition.gatewayId" :placeholder="lang.addEditDialog.gatewayId"
                                              clearable :title="condition.gatewayId"
                                              @keyup.enter.native='queryDeviceByCondition'
                                              @blur="condition.deviceName=condition.deviceName.replace(/^\s+|\s+$/g,'')"
                                              @clear="queryDeviceByCondition">
                                        <i slot="prefix" class="el-input__icon el-icon-search"
                                           @click="queryDeviceByCondition"></i>
                                    </el-input>
                                </div>
                            </el-col>
                        </el-row>
                    </transition>
                    <div class="separate-area">
                        <div></div>
                        <i :class="showSeparate?'el-icon-arrow-up':'el-icon-arrow-down'"
                           @click="showSeparate=!showSeparate"></i>
                        <div></div>
                    </div>
                </el-form>
            </div>
            <div class="function-button">
                <span @click="SynchronousEquipment">
                    <i class="el-icon-refresh"></i>
                    {{lang.deviceManage.buttons.synchronization}}
                  </span>
                <span @click="openDeviceDialog('add', {})">
                    <i class="el-icon-circle-plus-outline"></i>
                    {{lang.deviceManage.buttons.create}}
                </span>
                <span @click="uploadData.dialog=true;">
                    <i class="el-icon-upload2"></i>
                    {{lang.deviceManage.buttons.import}}
                </span>
                <span v-if="!deviceList.downLoadStatus" @click="downLoadCurrentDevices">
                    <i class="el-icon-download"></i>
                    {{lang.deviceManage.buttons.export}}
                </span>
                <span v-else="deviceList.downLoadStatus">
                    <i class="el-icon-loading"></i>
                    {{lang.deviceManage.buttons.exporting}}
                </span>
                <span v-if="!deviceList.downLoadAllStatus" @click="downLoadAllDevices">
                    <i class="el-icon-download"></i>
                    {{lang.deviceManage.buttons.exportAll}}
                </span>
                <span v-else="deviceList.downLoadAllStatus">
                    <i class="el-icon-loading"></i>
                    {{lang.deviceManage.buttons.exporting}}
                </span>
            </div>
            <div class="table-area hw-table table">
                <el-table ref="singleTable" :data="deviceList.dataList" style="width:99.5%"
                          @row-click="locateFlashMarker" v-loading="deviceList.loading">
                    <el-table-column type="expand" width="20">
                        <template slot-scope="props">
                            <div class="table-row-detail">
                                <el-row v-show="props.row.address">
                                    <el-col :span="24">
                                        <span>{{lang.deviceManage.tableArea.address}}</span>
                                        <span class="col-text"
                                              :title="props.row.address || ''">{{ props.row.address || ''}}</span>
                                        <i class="el-icon-document-copy" :title="lang.deviceManage.tableArea.copy"
                                           @click="copyText(props.row.address)" @mouseenter="spanAddBackground"
                                           @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="12">
                                        <span>{{lang.deviceManage.tableArea.externalCode}}</span>
                                        <span
                                                :title="props.row.externalCode || ''">{{ props.row.externalCode || ''}}</span>
                                        <i v-show="props.row.externalCode" class="el-icon-document-copy"
                                           :title="lang.deviceManage.tableArea.copy"
                                           @click="copyText(props.row.externalCode)" @mouseenter="spanAddBackground"
                                           @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                    <el-col :span="12">
                                        <span>{{lang.deviceManage.tableArea.connectStatus}}</span>
                                        <span>
                                            {{props.row.connectStatus == '2' ? (channelIOT.indexOf(props.row.channelCode)!=-1 ? lang.deviceManage.tableArea.notConnected : '--') : (props.row.connectStatus == '0' ? lang.deviceManage.tableArea.online:lang.deviceManage.tableArea.offline)}}
                                        </span>
                                        <i v-show="channelIOT.indexOf(props.row.channelCode)!=-1 || props.row.connectStatus == '0' || props.row.connectStatus == '1'"
                                           class="el-icon-document-copy" :title="lang.deviceManage.tableArea.copy"
                                           @click="copyStatus(props.row.connectStatus)" @mouseenter="spanAddBackground"
                                           @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="12">
                                        <span>{{lang.deviceManage.tableArea.deviceName}}</span>
                                        <span :title="props.row.deviceName || ''">{{ props.row.deviceName || ''}}</span>
                                        <i class="el-icon-document-copy" :title="lang.deviceManage.tableArea.copy"
                                           @click="copyText(props.row.deviceName)" @mouseenter="spanAddBackground"
                                           @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                    <el-col :span="12">
                                        <span>{{lang.deviceManage.tableArea.channelCode}}</span>
                                        <span
                                                :title="props.row.channelCode || ''">{{ props.row.channelCode || ''}}</span>
                                        <i class="el-icon-document-copy" :title="lang.deviceManage.tableArea.copy"
                                           @click="copyText(props.row.channelCode)" @mouseenter="spanAddBackground"
                                           @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="12">
                                        <span>{{lang.deviceManage.tableArea.deviceDefName}}</span>
                                        <span
                                                :title="props.row.deviceDef.defName || ''">{{ props.row.deviceDef.defName || ''}}</span>
                                        <i class="el-icon-document-copy" :title="lang.deviceManage.tableArea.copy"
                                           @click="copyText(props.row.deviceDef.defName)"
                                           @mouseenter="spanAddBackground" @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                    <el-col :span="12">
                                        <span>{{lang.deviceManage.tableArea.deviceDefCode}}</span>
                                        <span
                                                :title="props.row.deviceDef.code || ''">{{ props.row.deviceDef.code || ''}}</span>
                                        <i class="el-icon-document-copy" :title="lang.deviceManage.tableArea.copy"
                                           @click="copyText(props.row.deviceDef.code)" @mouseenter="spanAddBackground"
                                           @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                </el-row>
                                <el-row v-show="props.row.deviceProduct && props.row.deviceProduct.id">
                                    <el-col :span="12">
                                        <span>{{lang.deviceManage.tableArea.deviceProductName}}</span>
                                        <span
                                                :title="props.row.deviceProduct['productName'] || ''">{{ props.row.deviceProduct['productName'] || ''}}</span>
                                        <i class="el-icon-document-copy" :title="lang.deviceManage.tableArea.copy"
                                           @click="copyText(props.row.deviceProduct['productName'])"
                                           @mouseenter="spanAddBackground" @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                    <el-col :span="12">
                                        <span>{{lang.deviceManage.tableArea.deviceProductCode}}</span>
                                        <span
                                                :title="props.row.deviceProduct['code'] || ''">{{ props.row.deviceProduct['code'] || ''}}</span>
                                        <i class="el-icon-document-copy" :title="lang.deviceManage.tableArea.copy"
                                           @click="copyText(props.row.deviceProduct['code'])"
                                           @mouseenter="spanAddBackground" @mouseout="spanMoveBackground"></i>
                                    </el-col>
                                </el-row>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="externalCode" :show-overflow-tooltip="true"
                                     :render-header="(h,obj) => renderHeader(h,obj,lang.deviceManage.tableArea.externalCode)">
                    </el-table-column>
                    <el-table-column prop="deviceName" :show-overflow-tooltip="true"
                                     :render-header="(h,obj) => renderHeader(h,obj,lang.deviceManage.tableArea.deviceName)">
                    </el-table-column>
                    <el-table-column show-overflow-tooltip="true"
                                     :render-header="(h,obj) => renderHeader(h,obj,lang.deviceManage.tableArea.status)">
                        <template slot-scope="scope">
                            <span
                                    :class="scope.row.status=='UNREG'?'device-unreg':(scope.row.status=='ACTIVE'?'device-active':(scope.row.status=='INACTIVE'?'device-inactive':'device-deleted'))">
                                {{scope.row.status=='ACTIVE'? lang.deviceManage.conditionArea.active : (scope.row.status=='INACTIVE'? lang.deviceManage.conditionArea.inactive : (scope.row.status=='DELETED'? lang.deviceManage.conditionArea.deleted : lang.deviceManage.conditionArea.unregistered))}}
                            </span>
                            <span
                                    :title="scope.row.connectStatus == '2' ? '':(scope.row.connectStatus == '0' ? lang.deviceManage.tableArea.online:lang.deviceManage.tableArea.offline)"
                                    :class="scope.row.connectStatus == '2' ? '':(scope.row.connectStatus == '0' ? 'el-icon-sunny':'connectStatus el-icon-sunny')"
                                    v-show="scope.row.connectStatus == '0' || scope.row.connectStatus == '1'"></span>
                        </template>
                    </el-table-column>
                    <el-table-column :show-overflow-tooltip="true"
                                     :render-header="(h,obj) => renderHeader(h,obj,lang.deviceManage.tableArea.equipmentSpecs)">
                        <template slot-scope="scope">
                            <span>{{scope.row.deviceDef.defName || '- -'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column class-name="handle" min-width="110"
                                     :render-header="(h,obj) => renderHeader(h,obj,lang.deviceManage.tableArea.operations)">
                        <template slot-scope="scope">
                            <div class="tableHandle">
                                <!--
                                <i class="el-icon-picture-outline"
                                   :title="lang.deviceManage.tableArea.equipmentPortrait"
                                   @click="openDeviceFacility(scope.row)"
                                   :disabled="scope.row.status=='DELETED' || scope.row.status=='UNREG'?true:false"></i>
                                   -->
                                <i class="el-icon-edit" :title="lang.deviceManage.tableArea.edit"
                                   @click="openDeviceDialog('edit', scope.row)"
                                   :disabled="scope.row.status=='DELETED' || scope.row.status=='UNREG'?true:false"></i>
                                <el-dropdown trigger="hover" @command="handleCommand"
                                             :title="lang.deviceManage.tableArea.more">
                                    <span class="el-dropdown-link tableHandle">
                                        <i class="el-icon-more"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <!-- <el-dropdown-item :command="{type: 'qrCode', row: scope.row}" icon="el-icon-tickets"
												:disabled="scope.row.status!='ACTIVE' || scope.row.status=='UNREG'">
                                                {{lang.deviceManage.tableArea.qrCode}}</el-dropdown-item> -->
                                        <!-- 设备属性信息-->
                                        <el-dropdown-item :command="{type: 'AttributeDef', row: scope.row}"
                                                          icon="el-icon-view">
                                            {{lang.deviceAttributeDialog.dialogTitle}}
                                        </el-dropdown-item>
                                        <!-- 显示物模型绑点信息-->
                                        <el-dropdown-item :command="{type: 'DeviceModelCnet', row: scope.row}"
                                                          icon="el-icon-connection"
                                                          v-show="channelIOT.indexOf(scope.row.channelCode)!=-1"
                                                          divided>
                                            {{lang.deviceManage.tableArea.deviceModelCnet}}
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{type: 'ACTIVE', row: scope.row}"
                                                          icon="el-icon-circle-check"
                                                          :disabled="scope.row.status=='ACTIVE' || scope.row.status=='DELETED' || scope.row.status=='UNREG'"
                                                          divided>
                                            {{lang.deviceManage.tableArea.enable}}
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{type: 'INACTIVE', row: scope.row}"
                                                          icon="el-icon-remove-outline"
                                                          :disabled="scope.row.status=='INACTIVE' || scope.row.status=='DELETED' || scope.row.status=='UNREG'">
                                            {{lang.deviceManage.tableArea.disable}}
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{type: 'COLLECT', row: scope.row}"
                                                          icon="el-icon-caret-right"
                                                          :disabled="scope.row.status=='DELETED' || scope.row.status=='UNREG' || scope.row.isCollecting"
                                                          divided>
                                            {{lang.deviceManage.tableArea.collectionLocation}}
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{type: 'STOPC', row: scope.row}"
                                                          icon="el-icon-close"
                                                          :disabled="scope.row.status=='DELETED' || scope.row.status=='UNREG' || !scope.row.isCollecting">
                                            {{lang.deviceManage.tableArea.stopAcquisition}}
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{type: 'RELATED', row: scope.row}"
                                                          icon="el-icon-connection"
                                                          :disabled="scope.row.status=='DELETED' || scope.row.status=='UNREG' || scope.row.isCollecting">
                                            {{lang.deviceManage.tableArea.associatedDevice}}
                                        </el-dropdown-item>
                                        <!-- 注册设备到IOT平台（channel在系统参数中这里才可见） -->
                                        <el-dropdown-item :command="{type: 'AddToIOT', row: scope.row}"
                                                          icon="el-icon-circle-plus-outline"
                                                          :disabled="scope.row.status=='DELETED'"
                                                          divided
                                                          v-show="channelIOT.indexOf(scope.row.channelCode)!=-1 && scope.row.status=='ACTIVE'">
                                            {{lang.deviceManage.tableArea.addToIOT}}
                                        </el-dropdown-item>
                                        <el-dropdown-item :title="lang.deviceManage.tableArea.onlyUpdateDeviceName"
                                                          :command="{type: 'UpdateToIOT', row: scope.row}"
                                                          :disabled="scope.row.status=='DELETED'"
                                                          icon="el-icon-edit-outline"
                                                          v-show="channelIOT.indexOf(scope.row.channelCode)!=-1 && scope.row.status=='ACTIVE'">
                                            {{lang.deviceManage.tableArea.updateToIOT}}
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{type: 'DeleteFromIOT', row: scope.row}"
                                                          icon="el-icon-delete"
                                                          v-show="channelIOT.indexOf(scope.row.channelCode)!=-1 && scope.row.status=='ACTIVE'">
                                            {{lang.deviceManage.tableArea.deleteFromIOT}}
                                        </el-dropdown-item>
                                        <!-- 废弃、删除 -->
                                        <el-dropdown-item :command="{type: 'DELETED', row: scope.row}"
                                                          icon="el-icon-close" :disabled="scope.row.status=='DELETED'"
                                                          divided>
                                            {{lang.deviceManage.tableArea.deprecated}}
                                        </el-dropdown-item>
                                        <el-dropdown-item :command="{type: 'DEL', row: scope.row}"
                                                          :disabled="scope.row.status!='DELETED'" icon="el-icon-delete">
                                            {{lang.deviceManage.tableArea.delete}}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <i :class="scope.row.deviceDef.code==='EnvSensor'
                                    ?'el-icon-odometer'
                                    :scope.row.deviceDef.code==='camera'
                                        ?'el-icon-video-camera':
                                        'el-icon-s-ticket'"
                                   :title="lang.deviceManage.tableArea.equipmentContent"
                                   @click="openDeviceFacility(scope.row)"
                                   :disabled="scope.row.status=='DELETED' || scope.row.status=='UNREG'?true:false"></i>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="hw-pagination pagination">
                    <el-pagination :pager-count="pageCount" @size-change="handleSizeChange"
                                   @current-change="handleCurrentChange" :current-page="deviceList.pageNum"
                                   :page-sizes="[10, 20, 30, 50]" :page-size="deviceList.pageSize"
                                   layout="total, sizes, prev, pager, next, jumper" :total="deviceList.total">
                    </el-pagination>
                </div>
            </div>
        </div>
    </transition>
    <el-dialog id="device-qrCode" :title="lang.qrCode" :visible.sync="deviceList.deviceQrCode"
               :modal-append-to-body=true v-dialogmove :append-to-body=true :close-on-press-escape=false
               :close-on-click-modal=false width="250px" height="210px">
        <div>
            <div id='previewDiv' :style="{width:'210px',height:'210px'}"></div>
        </div>
    </el-dialog>

    <!-- 新建设备实例弹框 -->
    <el-dialog id="device-addEdit-dialog" class="hw-dialog wh-form" v-if="device.addEditDeviceDialog"
               :title="deviceData.id? lang.addEditDialog.editDevice : lang.addEditDialog.addDevice" v-dialogmove
               :modal-append-to-body=true :append-to-body=true :close-on-press-escape=false :close-on-click-modal=false
               :visible.sync="device.addEditDeviceDialog" @closed="closeDeviceDialog" width="810px">
        <div>
            <div class="hw-steps device-setps-header">
                <el-steps :active="device.activeTab" align-center finish-status="success">
                    <el-step :title="lang.addEditDialog.basicInformation"></el-step>
                    <el-step :title="lang.addEditDialog.deviceConfiguration"></el-step>
                </el-steps>
            </div>

            <el-form size="small" v-show="device.activeTab=='1'" :model="deviceData" ref="deviceData"
                     :rules="device.rules" class="forms">
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item :label="lang.addEditDialog.externalEncoding" prop="externalCode">
                            <div class="hw-input hw-input__small hw-input--border hw-inputnum">
                                <el-input v-model="deviceData.externalCode" clearable maxlength="85" class='wh-input'
                                          show-word-limit :title="deviceData.externalCode"
                                          :placeholder="lang.addEditDialog.externalEncodingPlaceholder"
                                          @blur="deviceData.externalCode=deviceData.externalCode.replace(/^\s+|\s+$/g,'')">
                                </el-input>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="lang.addEditDialog.deviceName" prop="deviceName">
                            <div class="hw-input hw-input__small hw-input--border hw-inputnum ">
                                <el-input v-model="deviceData.deviceName" clearable maxlength="85" class='wh-input'
                                          show-word-limit :title="deviceData.deviceName"
                                          :placeholder="lang.addEditDialog.deviceNamePlaceholder"
                                          @blur="deviceData.deviceName=deviceData.deviceName.replace(/^\s+|\s+$/g,'')">
                                </el-input>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item :label="lang.addEditDialog.equipmentSpecs + deviceData.deviceDefCode"
                                      prop="deviceDefName">
                            <div class="hw-input hw-input__small hw-input--border">
                                <el-input v-model="deviceData.deviceDefName" readonly :disabled="!!deviceData.id"
                                          :title="deviceData.deviceDefName" @focus="openDeviceDefDialog"
                                          :placeholder="lang.addEditDialog.equipmentSpecsPlaceholder">
                                    <el-button slot="append" icon="el-icon-search" style="padding-top: 4px"
                                               :disabled="!!deviceData.id" @click="openDeviceDefDialog">
                                    </el-button>
                                </el-input>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="lang.addEditDialog.equipmentSource">
                            <div class="hw-select hw-select--border">
                                <el-select v-model="deviceData.channel" filterable clearable
                                           :placeholder="lang.addEditDialog.equipmentSourcePlaceholder">
                                    <el-option v-for="item in device.deviceChannels" :key="item.id" :label="item.code"
                                               :value="item.id">
                                        <span style="float: left">{{ item.code }}</span>
                                        <span
                                                style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
                                    </el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item :label="lang.addEditDialog.status" prop="status">
                            <div class="hw-select hw-select--border">
                                <el-select v-model="deviceData.status" :disabled="!!deviceData.id">
                                    <el-option :label="lang.addEditDialog.activated" value="ACTIVE"></el-option>
                                    <el-option :label="lang.addEditDialog.notActivated" value="INACTIVE"></el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="lang.addEditDialog.equipmentProducts">
                            <div class="hw-select hw-select--border">
                                <el-select v-model="deviceData.deviceProduct" filterable clearable
                                           :placeholder="lang.addEditDialog.equipmentProductsPlaceholder">
                                    <el-option v-for="item in device.deviceProducts" :key="item.id" :label="item.code"
                                               :value="item.id">
                                        <span style="float: left">{{ item.code }}</span>
                                        <span
                                                style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span>
                                    </el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12" class="flex">
                        <el-form-item :label="lang.addEditDialog.position">
                            <div v-if="!currentSpace.id" class="hw-input hw-input__small hw-input--border">
                                <el-input v-model="deviceLocation.spaceLabel" readonly class="input-with-search"
                                          :title="deviceLocation.spaceLabel" class="conditions-selects"
                                          @focus="openSpaceDialog"
                                          :placeholder="lang.addEditDialog.positionPlaceholder">
                                    <el-button slot="append" icon="el-icon-search" @click="openSpaceDialog"></el-button>
                                </el-input>
                            </div>
                            <div v-else class="hw-cascader hw-cascader--border cascader-two"
                                 @mouseenter="cascaderTitle('cascader-two')">
                                <el-cascader popper-class='hw-arrow' :options="spaceOptions"
                                             :props="{ checkStrictly: true }" v-model="space.condition.spacePathList"
                                             @expand-change="cascaderNodeAddTitleSpace"></el-cascader>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" class="flex">
                        <el-form-item :label="lang.addEditDialog.gatewayId">
                            <div class="hw-input hw-input__small hw-input--border hw-inputnum">
                                <el-input v-model="deviceData.gatewayId" clearable maxlength="85" class='wh-input'
                                          show-word-limit :title="deviceData.gatewayId"
                                          :placeholder="lang.addEditDialog.gatewayIdPlaceholder"
                                          @blur="deviceData.gatewayId=deviceData.gatewayId.replace(/^\s+|\s+$/g,'')">
                                </el-input>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12" class="flex">
                        <el-form-item :label="lang.addEditDialog.nodeId">
                            <div class="hw-input hw-input__small hw-input--border hw-inputnum">
                                <el-input v-model="deviceData.nodeId" clearable maxlength="85" class='wh-input'
                                          show-word-limit :title="deviceData.nodeId"
                                          :placeholder="lang.addEditDialog.nodeIdPlaceholder"
                                          @blur="deviceData.nodeId=deviceData.nodeId.replace(/^\s+|\s+$/g,'')">
                                </el-input>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="lang.addEditDialog.configurationName">
                            <div class="hw-select hw-select--border">
                                <el-select v-model="deviceData.hmi" filterable
                                           :placeholder="lang.addEditDialog.configurationNamePlaceholder"
                                           @change="selectOne">
                                    <el-option v-for="item in device.configNames" :key="item.value" :label="item.label"
                                               :value="item.value">
                                    </el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item :label="lang.addEditDialog.remark">
                            <div class="hw-input hw-input--textarea">
                                <el-input v-model="deviceData.remark" type="textarea" maxlength="255" show-word-limit
                                          @blur="deviceData.remark=deviceData.remark.replace(/^\s+|\s+$/g,'')"></el-input>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <div v-show="device.activeTab=='2'">
                <el-form class="forms">
                    <el-row :gutter="8">
                        <el-col :span="6">
                            <el-form-item :label="lang.addEditDialog.longitude">
                                <div class="hw-input hw-input__small hw-input--border">
                                    <el-input oninput="value=value.replace(/[^\d.-]/g,'')"
                                              v-model="deviceLocation.longitude"
                                              :title="deviceLocation.longitude"></el-input>
                                </div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item :label="lang.addEditDialog.latitude">
                                <div class="hw-input hw-input__small hw-input--border">
                                    <el-input oninput="value=value.replace(/[^\d.-]/g,'')"
                                              v-model="deviceLocation.latitude"
                                              :title="deviceLocation.latitude"></el-input>
                                </div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="4">
                            <el-form-item :label="lang.addEditDialog.height">
                                <div class="hw-input hw-input__small hw-input--border">
                                    <el-input oninput="value=value.replace(/[^\d.-]/g,'')"
                                              v-model="deviceLocation.altitude"
                                              :title="deviceLocation.altitude"></el-input>
                                </div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="4">
                            <el-form-item :label="lang.addEditDialog.building">
                                <div class="hw-input hw-input__small hw-input--border">
                                    <el-input v-model="deviceLocation.building" :title="deviceLocation.building"
                                              @blur="deviceLocation.building=deviceLocation.building.replace(/^\s+|\s+$/g,'')">
                                    </el-input>
                                </div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="4">
                            <el-form-item :label="lang.addEditDialog.floor">
                                <div class="hw-input hw-input__small hw-input--border">
                                    <el-input v-model="deviceLocation.floor" :title="deviceLocation.floor"
                                              @blur="deviceLocation.floor=deviceLocation.floor.replace(/^\s+|\s+$/g,'')">
                                    </el-input>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <div class="device-attibute">
                    <div class="title">
                        <span></span>
                        <span> = {{lang.addEditDialog.requiredInformation}}</span>
                    </div>

                    <div class="hw-tabs">
                        <el-tabs type="border-card" v-model="deviceAttrTab">
                            <el-tab-pane :label="lang.addEditDialog.dynamicAttribute" name="dynamicAttr">
                                <el-row :gutter="5" class="attribute-title">
                                    <el-col :span="4">
                                        <span>{{lang.addEditDialog.attributeName}}</span>
                                    </el-col>
                                    <el-col :span="4">
                                        <span>{{lang.addEditDialog.attributeEncoding}}</span>
                                    </el-col>
                                    <el-col :span="4">
                                        <span>{{lang.addEditDialog.attributeType}}</span>
                                    </el-col>
                                    <el-col :span="6">
                                        <span>{{lang.addEditDialog.externalEncoding}}</span>
                                    </el-col>
                                    <el-col :span="6">
                                        <span>{{lang.addEditDialog.attributeValue}}</span>
                                    </el-col>
                                </el-row>
                                <div class="attr-display">
                                    <el-row :gutter="5" v-if="item.valueType!='1'"
                                            v-for="(item, index) in device.deviceAttribute.filter(function(e){return e.attrType=='DYNAMIC'})"
                                            :key="index">
                                        <div class="flex">
                                            <el-col :span="4">
                                                <div class="hw-input hw-input__small">
                                                    <el-input v-model="item.attrLabelDisplay" disabled
                                                              :title="'('+item.attrType+')' + lang.addEditDialog.attributeEncoding +'：'+item.code +', ' + lang.addEditDialog.unit + '：'+(item.unit ? item.unit.unitLabel: '')+', ' + lang.addEditDialog.typesof + '：'+item.primaryType">
                                                    </el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="4">
                                                <div class="hw-input hw-input__small">
                                                    <el-input v-model="item.code" disabled
                                                              :title="lang.addEditDialog.attributeEncoding + '：'+item.code">
                                                    </el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="4">
                                                <div class="hw-input hw-input__small">
                                                    <el-input v-model="item.attrTypeDisplay" disabled
                                                              :title="item.attrType"></el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="6">
                                                <div class="hw-input hw-input__small hw-input--border">
                                                    <el-input v-model="item.externalCode"
                                                              :title="item.attrType=='INSTANCE'? lang.addEditDialog.instanceHaveNoExternalEncoding :'(' + lang.addEditDialog.point + '：)' + item.externalCode"
                                                              :disabled="item.attrType=='INSTANCE'"
                                                              @blur="item.externalCode=item.externalCode.replace(/^\s+|\s+$/g,'')">
                                                    </el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="6">
                                                <div class="hw-input hw-input__small hw-input--border unitCode"
                                                     :class="dynamicAttrShowFlag? 'unitCodetrue' : 'unitCodefalse'">
                                                    <el-input v-model="item.attributeValue"
                                                              :title="item.attributeValue ? (item.unit ? item.attributeValue +' '+item.unit.code : '') :''"
                                                              @blur="item.attributeValue=(item.attributeValue?item.attributeValue.replace(/^\s+|\s+$/g,''):'')"
                                                              :disabled="dynamicAttrShowFlag">
                                                    </el-input>
                                                    <span>{{item.unit ? item.unit.code :''}}</span>
                                                </div>
                                            </el-col>
                                        </div>
                                    </el-row>
                                    <div v-else>
                                        <el-row :gutter="5" v-for="(typeValue, typeIndex) in item.valueTypeList"
                                                :key="typeIndex">
                                            <el-col :span="4">
                                                <div class="hw-input hw-input__small">
                                                    <el-input v-model="typeValue.attrLabelDisplay" disabled
                                                              :title="'('+typeValue.attrType+')' + lang.addEditDialog.attributeEncoding + '：'+typeValue.code +', ' + lang.addEditDialog.unit + '：'+typeValue.unit.unitLabel+', ' + lang.addEditDialog.typesof + '：'+typeValue.primaryType">
                                                    </el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="4">
                                                <div class="hw-input hw-input__small">
                                                    <el-input v-model="item.code" disabled
                                                              :title="lang.addEditDialog.attributeEncoding + '：'+item.code">
                                                    </el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="4">
                                                <div class="hw-input hw-input__small">
                                                    <el-input v-model="typeValue.attrTypeDisplay" disabled
                                                              :title="typeValue.attrType"></el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="6">
                                                <div class="hw-input hw-input__small hw-input--border">
                                                    <el-input v-model="typeValue.externalCode"
                                                              :title="typeValue.attrType=='INSTANCE'? lang.addEditDialog.instanceHaveNoExternalEncoding :'(' + lang.addEditDialog.point + '：)' + typeValue.externalCode"
                                                              :disabled="typeValue.attrType=='INSTANCE'"
                                                              @blur="typeValue.externalCode=typeValue.externalCode.replace(/^\s+|\s+$/g,'')">
                                                    </el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="5">
                                                <div class="hw-input hw-input__small hw-input--border">
                                                    <el-input v-model="typeValue.attributeValue"
                                                              :title="typeValue.attributeValue"
                                                              @blur="typeValue.attributeValue=typeValue.attributeValue.replace(/^\s+|\s+$/g,'')">
                                                    </el-input>
                                                </div>
                                            </el-col>
                                            <el-col :span="1">
                                                <div class="flex operation">
                                                    <i class="el-icon-plus"
                                                       :title="lang.addEditDialog.increaseAttribute"
                                                       @click="valueTypeAdd(item)"></i>
                                                    <i class="el-icon-minus" :title="lang.addEditDialog.deleteAttribute"
                                                       @click="valueTypeDel(item, typeIndex)"
                                                       :disabled="item.valueTypeList.length==1"></i>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </div>
                                <span>{{lang.addEditDialog.totalDynamicAttributes}}：{{dynamicAttrCount}}</span>
                            </el-tab-pane>
                            <el-tab-pane :label="lang.addEditDialog.instanceAttribute" name="instanceAttr">
                                <el-row :gutter="5" class="attribute-title">
                                    <el-col :span="6" show-overflow-tooltip>
                                        <span>{{lang.addEditDialog.attributeName}}</span>
                                    </el-col>
                                    <el-col :span="5" show-overflow-tooltip>
                                        <span>{{lang.addEditDialog.attributeEncoding}}</span>
                                    </el-col>
                                    <el-col :span="4" show-overflow-tooltip>
                                        <span>{{lang.addEditDialog.attributeType}}</span>
                                    </el-col>
                                    <el-col :span="9" show-overflow-tooltip>
                                        <span>{{lang.addEditDialog.attributeValue}}</span>
                                    </el-col>
                                </el-row>
                                <div class="attr-display">
                                    <el-row :gutter="5"
                                            v-for="(item, index) in device.deviceAttribute.filter(function(e){return e.attrType=='INSTANCE'})"
                                            :key="index">
                                        <el-col :span="6">
                                            <div class="hw-input hw-input__small">
                                                <el-input v-model="item.attrLabelDisplay" disabled
                                                          :title="'('+item.attrType+')'+ lang.addEditDialog.attributeEncoding +'：'+item.code +', ' + lang.addEditDialog.unit + '：'+(item.unit ? item.unit.unitLabel: '')+', ' + lang.addEditDialog.typesof + '：'+item.primaryType">
                                                </el-input>
                                            </div>
                                        </el-col>
                                        <el-col :span="5">
                                            <div class="hw-input hw-input__small">
                                                <el-input v-model="item.code" disabled
                                                          :title="lang.addEditDialog.attributeEncoding + '：'+item.code">
                                                </el-input>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="hw-input hw-input__small">
                                                <el-input v-model="item.attrTypeDisplay" disabled
                                                          :title="item.attrType"></el-input>
                                            </div>
                                        </el-col>
                                        <el-col :span="9">
                                            <div class="hw-input hw-input__small hw-input--border">
                                                <el-input v-model="item.attributeValue" :title="item.attributeValue"
                                                          :class="(item.attrType=='INSTANCE' && item.isMandatory)?'border-left':''"
                                                          @blur="item.attributeValue=item.attributeValue.replace(/^\s+|\s+$/g,'')">
                                                </el-input>
                                                <span>{{item.unit ? item.unit.code : ''}}</span>
                                            </div>
                                        </el-col>
                                    </el-row>
                                </div>
                                <span>{{lang.addEditDialog.totalInstanceAttributes}}：{{(device.deviceAttribute.filter(function(e){return e.attrType=='INSTANCE'})).length}}</span>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </div>
            </div>
            <el-divider></el-divider>
            <div class="footer">
                <div class="hw-button hw-button--small hw-button--ghost">
                    <el-button @click="closeDeviceDialog">{{lang.addEditDialog.cancel}}</el-button>
                </div>
                <div class="hw-button hw-button--small hw-button--primary"
                     v-if="device.activeTab=='1' && !!deviceData.id">
                    <el-button type="primary" @click="saveDeviceBasicInfo" :loading="buttonSaveLoading"
                               :disabled="buttonSaveLoading">
                        {{lang.addEditDialog.save}}
                    </el-button>
                </div>
                <div class="hw-button hw-button--small hw-button--info" v-if="device.activeTab=='1'">
                    <el-button type="info" @click="changeTab">{{lang.addEditDialog.next}}</el-button>
                </div>
                <div class="hw-button hw-button--small hw-button--info" v-if="device.activeTab=='2'">
                    <el-button type="info" @click="changeTab">{{lang.addEditDialog.previous}}</el-button>
                </div>
                <div class="hw-button hw-button--small hw-button--primary" v-if="device.activeTab=='2'">
                    <el-button type="primary" @click="saveDevice" :loading="buttonSaveLoading"
                               :disabled="buttonSaveLoading">
                        {{lang.addEditDialog.save}}
                    </el-button>
                </div>
            </div>
        </div>
    </el-dialog>

    <!-- 设备关联关系 -->
    <!-- EBRU -->
    <el-dialog :title="lang.deviceassociationdialog.deviceassociation" id="deviceRelation"
               v-if="deviceRelation.showDeviceRelation" class="relation-dialog hw-dialog" :modal-append-to-body=true
               :append-to-body=true :close-on-press-escape=false :close-on-click-modal=false v-dialogmove
               :visible.sync="deviceRelation.showDeviceRelation" @close="closeDeviceRelationDialog" width="790px">
        <div>
            <div class="hw-table hw-table--border">
                <el-table id="relatedTable" :data="deviceRelation.dataList" size="mini" class="table table-border"
                          border>
                    <el-table-column :label="lang.tablecolumn.associateddevice" prop="relatedDevice.deviceName"
                                     show-overflow-tooltip width="205px">
                    </el-table-column>
                    <el-table-column :label="lang.tablecolumn.associationtype" prop="type.relationName"
                                     show-overflow-tooltip width="205px"></el-table-column>
                    <el-table-column :label="lang.tablecolumn.creationtime" prop="createDate" show-overflow-tooltip
                                     width="205px">
                    </el-table-column>
                    <el-table-column :label="lang.tablecolumn.operation" show-overflow-tooltip width="110px">
                        <template slot-scope="scope">
                            <div class="tableHandle">
                                <i class="el-icon-edit" :title="lang.icon.edit"
                                   @click="editDeviceRelation(scope.row)"></i>
                                <i class="el-icon-delete" :title="lang.icon.delete"
                                   @click="deleteDeviceRelation(scope.row)"></i>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <el-table id="newData" :data="deviceRelation.currentData" size="mini" class="table" width='726px'>
                    <el-table-column class="el-icon-plus">
                        <template slot-scope="scope">
                            <div id="changgeIcon" class="tableHandle" @click="actionIcon(1)">
                                <i class="el-icon-plus"><span style="margin-left:10px;">{{lang.icon.new}}</span></i>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <el-table id="newData1" v-if="deviceRelation.newIcon" :data="deviceRelation.currentData" size="mini"
                          class="table table-border" width='724px'>
                    <el-table-column>
                        <template slot-scope="scope">
                            <el-form :model="deviceRelation" :inline="true" class="forms">
                                <el-form-item :label="lang.formitem.associateddevice">
                                    <el-input id="selectOption" readonly="true"
                                              :disabled="deviceRelation.relatedDeviceDisable"
                                              style="width: 320px;height: 40px;border-radius: 4px;"
                                              :placeholder="lang.placeholder.selectdevice"
                                              v-model="deviceRelation.selectedData"
                                              @click.native="associatedDeviceOpen">
                                        <i slot="suffix" class="el-select__caret el-input__icon el-icon-arrow-up"
                                           style="transform: rotateZ(180deg);"></i>
                                    </el-input>
                                </el-form-item>
                                <el-form-item :label="lang.formitem.associationtype">
                                    <el-select style="width: 320px;height: 40px;border-radius: 4px;"
                                               v-model="deviceRelation.selectedType"
                                               :placeholder="lang.placeholder.selectassociationtype">
                                        <el-option v-for="item in deviceRelation.typeList" :label="item.relationName"
                                                   :value="item.code">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-form>
                            <div class="footer footer-ext">
                                <div class="hw-button hw-button--small hw-button--ghost">
                                    <el-button type="ghost" @click="closeRelationTypeDialog">{{lang.button.cancel}}
                                    </el-button>
                                </div>
                                <div class="hw-button hw-button--small hw-button--primary">
                                    <el-button type="primary" @click="saveDeviceRelation" style="margin-left: 1.5rem;"
                                               :loading="buttonSaveLoading" :disabled="buttonSaveLoading">
                                        {{lang.button.save}}
                                    </el-button>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </el-dialog>

    <el-dialog :title="lang.formitem.associateddevice" :append-to-body="true" :visible.sync="associatedDevice"
               class="hw-dialog">
        <div>
            <el-form :model="deviceSelect.condition" class="forms">
                <el-row :gutter="10" class="deviceName" style="margin-bottom:24px;margin-top: 16px;">
                    <el-col :span="12">
                        <div class="hw-input hw-input__small hw-input--border">
                            <el-input v-model="deviceSelect.condition.deviceName"
                                      :placeholder="lang.placeholder.enterdevicename"
                                      @keyup.enter.native='querySelectDeviceByCondition'>
                                <i slot="suffix" class="el-input__icon el-icon-search"
                                   @click="querySelectDeviceByCondition"></i>
                            </el-input>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div class="hw-input hw-input__small hw-input--border">
                            <el-input v-model="deviceSelect.condition.externalCode"
                                      :placeholder="lang.placeholder.enterexternaldevicecode"
                                      @keyup.enter.native='querySelectDeviceByCondition'>
                                <i slot="suffix" class="el-input__icon el-icon-search"
                                   @click="querySelectDeviceByCondition"></i>
                            </el-input>
                        </div>
                    </el-col>
                </el-row>
            </el-form>
        </div>
        <div id="selectedDevice" class="hw-table">
            <el-table :data="deviceSelect.dataList" size="mini" @current-change="handleDeviceSelectChange"
                      class="table table-border">
                <el-table-column width="40">
                    <template slot-scope="scope">
                        <el-radio v-model="deviceSelect.currentRow" :label="scope.row"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column :label="lang.tablecolumn.devicename" prop="deviceName" show-overflow-tooltip
                                 width="180">
                </el-table-column>
                <el-table-column :label="lang.tablecolumn.externaldevicecode" prop="externalCode" show-overflow-tooltip>
                </el-table-column>
                <el-table-column :label="lang.tablecolumn.devicesourcecode" prop="channelCode" show-overflow-tooltip>
                </el-table-column>
            </el-table>
        </div>
        <div class="hw-pagination pagination page-style">
            <el-pagination :pager-count="pageCount" @size-change="handleSizeDeviceChange"
                           @current-change="handleCurrentDeviceChange" :current-page="deviceSelect.pageNum"
                           :page-sizes="[10, 20, 30, 50]" :page-size="deviceSelect.pageSize"
                           layout="total, sizes, prev, pager, next, jumper" :total="deviceSelect.total">
            </el-pagination>
        </div>
        <div class="footer footer-ext">
            <div class="hw-button hw-button--small hw-button--ghost">
                <el-button type="ghost" @click="closeAssociatedDialog">{{lang.button.cancel}}</el-button>
            </div>
            <div class="hw-button hw-button--small hw-button--primary">
                <el-button type="primary" @click="saveAssociateDevice" style="margin-left: 1.5rem;">{{lang.button.save}}
                </el-button>
            </div>
        </div>
    </el-dialog>
    <!-- 选择设备规格定义 -->
    <el-dialog id="device-def-dialog" :title="lang.defDialog.dialogTitle" :modal-append-to-body=true
               :append-to-body=true v-if="deviceDef.dialog" v-dialogmove :close-on-press-escape=false
               :close-on-click-modal=false :visible.sync="deviceDef.dialog" @close="closeDeviceDefDialog"
               class="hw-dialog"
               width="50rem">
        <el-form :model="deviceDef.condition" :inline="true" class="forms" @submit.native.prevent>
            <el-form-item>
                <div class="hw-input hw-input__small hw-input--border">
                    <el-input :placeholder="lang.defDialog.specName" v-model="deviceDef.condition.defName" clearable
                              @keyup.enter.native="queryDefListData" @clear="queryDefListData"></el-input>
                </div>
            </el-form-item>
            <el-form-item>
                <div class="hw-input hw-input__small hw-input--border">
                    <el-input :placeholder="lang.defDialog.code" v-model="deviceDef.condition.code" clearable
                              @keyup.enter.native="queryDefListData" @clear="queryDefListData"></el-input>
                </div>
            </el-form-item>

            <div class="hw-button hw-button--small hw-button--primary">
                <el-button type="primary" @click="queryDefListData">{{lang.defDialog.search}}</el-button>
            </div>
        </el-form>
        <div class="hw-table hw-table--border">
            <el-table :data="deviceDef.datas" size="mini" @current-change="handleDeviceDefChange"
                      v-loading="deviceDef.loading" border>
                <el-table-column width="40">
                    <template slot-scope="scope">
                        <el-radio v-model="deviceDef.currentRow.id" :label="scope.row.id"></el-radio>
                    </template>
                </el-table-column>
                <el-table-column :label="lang.defDialog.specName" prop="deviceName" show-overflow-tooltip>
                </el-table-column>
                <el-table-column :label="lang.defDialog.specCoding" prop="code" show-overflow-tooltip></el-table-column>
                <el-table-column :label="lang.defDialog.defaultSource" show-overflow-tooltip>
                    <template slot-scope="scope">
                        {{scope.row.channel.code}}
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="pagination hw-pagination">
            <el-pagination :pager-count="pageCount" @current-change="handleDefCurrentChange"
                           :current-page="deviceDef.pageNum" :page-size="deviceDef.pageSize"
                           layout="total, prev, pager, next"
                           :total="deviceDef.total">
            </el-pagination>
        </div>
        <el-divider></el-divider>
        <div class="footer">
            <div class="hw-button hw-button--small hw-button--ghost">
                <el-button type="ghost" @click="closeDeviceDefDialog">{{lang.defDialog.cancel}}</el-button>
            </div>
            <div class="hw-button hw-button--small hw-button--primary">
                <el-button type="primary" @click="saveDeviceDef">{{lang.defDialog.save}}</el-button>
            </div>
        </div>
    </el-dialog>

    <!-- 选择设备位置空间 -->
    <el-dialog id="device-space-dialog" :title="lang.spaceDialog.dialogTitle" class="hw-dialog"
               :modal-append-to-body=true v-if="space.dialog" :append-to-body=true :close-on-press-escape=false
               :close-on-click-modal=false :visible.sync="space.dialog" @open="openSpaceDialog" v-dialogmove
               @close="closeSpaceDialog" width="750px">
        <div>
            <el-form :model="space.condition" :inline="true" class="forms">
                <el-form-item v-if="!currentSpace.id">
                    <div class="hw-select hw-input__small hw-select--border">
                        <el-select v-model="space.condition.spaceRootCode" :placeholder="lang.spaceDialog.spaceRoot"
                                   clearable>
                            <el-option v-for="(item, index) in space.spaceRoots"
                                       :label="item.spaceRootName || item.code" :value="item.code"
                                       :key="index"></el-option>
                        </el-select>
                    </div>
                </el-form-item>
                <el-form-item>
                    <div class="hw-input hw-input__small hw-input--border">
                        <el-input :placeholder="lang.spaceDialog.spaceName" v-model="space.condition.spaceName"
                                  clearable @keyup.enter.native="querySpaceListData"
                                  @clear="querySpaceListData"></el-input>
                    </div>
                </el-form-item>
                <div class="hw-button hw-button--small hw-button--info">
                    <el-button type="primary" @click="querySpaceListData">{{lang.spaceDialog.search}}</el-button>
                </div>
            </el-form>

            <div class="hw-table hw-table--border">
                <el-table :data="space.datas" size="mini" @current-change="handleSpaceChange" v-loading="space.loading"
                          border>
                    <el-table-column width="40">
                        <template slot-scope="scope">
                            <el-radio v-model="space.currentRow.id" :label="scope.row.id"></el-radio>
                        </template>
                    </el-table-column>
                    <el-table-column :label="lang.spaceDialog.spaceName" prop="spaceName" show-overflow-tooltip
                                     width="150">
                    </el-table-column>
                    <el-table-column :label="lang.spaceDialog.position" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span>{{scope.row.address || '- -'}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="pagination hw-pagination">
                <el-pagination :pager-count="pageCount" @current-change="handleSpaceCurrentChange"
                               :current-page="space.pageNum" :page-size="space.pageSize"
                               layout="total, prev, pager, next"
                               :total="space.total">
                </el-pagination>
            </div>
            <el-divider></el-divider>
            <div class="footer">
                <div class="hw-button hw-button--small hw-button--ghost">
                    <el-button type="ghost" @click="closeSpaceDialog">{{lang.spaceDialog.cancel}}</el-button>
                </div>
                <div class="hw-button hw-button--small hw-button--primary">
                    <el-button type="primary" @click="saveSpace">{{lang.spaceDialog.save}}</el-button>
                </div>
            </div>
        </div>
    </el-dialog>

    <!-- 上传设备实例数据 -->
    <el-dialog id="device-upload-dialog" :title="lang.uploadDialog.dialogTitle" class="hw-dialog"
               v-if="uploadData.dialog" :modal-append-to-body=true :append-to-body=true :close-on-press-escape=false
               :close-on-click-modal=false :visible.sync="uploadData.dialog" @open="" v-dialogmove
               @close="uploadData.fileList=[]" width="500px" height="600px">
        <div>
            <a :href="uploadData.downUrl" download="Device_deviceDataImport"
               class="download">{{lang.uploadDialog.downloadTemplate}}</a>
            <div class="upload newupdal">
                <el-upload class="upload-demo" drag action="/xx" :limit="1" ref="upload" accept=".xls,.xlsx" action=""
                           :file-list="uploadData.fileList" :http-request="uploadSectionFile" :auto-upload="false">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">{{lang.uploadDialog.dragFiles}}
                        <em>{{lang.uploadDialog.clickUpload}}</em></div>
                    <div class="el-upload__tip" slot="tip">{{lang.uploadDialog.message}}</div>
                </el-upload>
            </div>
            <div class="footer">
                <div class="hw-button hw-button--small hw-button--ghost">
                    <el-button type="ghost" @click="uploadData.dialog=false">{{lang.uploadDialog.cancel}}</el-button>
                </div>
                <div class="hw-button hw-button--small hw-button--primary">
                    <el-button type="primary" @click="submitUpload">{{lang.uploadDialog.import}}</el-button>
                </div>
            </div>
        </div>
    </el-dialog>

    <!-- 右上角仪表盘显示 -->
    <div class="DeviceManageStatus">
        <div class="switch-button status-left" @click="isShowDeviceStatus=!isShowDeviceStatus"
             v-show="isShowDeviceStatus">
            <i class="el-icon-arrow-left"></i>
        </div>
        <div class="switch-button status-right" @click="isShowDeviceStatus=!isShowDeviceStatus"
             v-show="!isShowDeviceStatus">
            <i class="el-icon-arrow-right"></i>
        </div>
        <transition name="fade" mode="in-out" appear>
            <div v-show="!isShowDeviceStatus" class="deviceStatus-area">
                <div class="left-area">
                    <div>
                        <span>{{lang.manageStatus.totalDevice}}：</span>
                        <span>{{deviceStatus.total}} {{lang.manageStatus.station}}</span>
                    </div>
                    <div id="my-canvas">
                        <canvas id="myCanvas">{{lang.manageStatus.html5CanvasNotSupported}}</canvas>
                    </div>
                </div>
                <div class="right-area">
                    <div>
                        <span>{{lang.manageStatus.activated}}</span>
                        <span :title="deviceStatus.active" class="device-active">{{deviceStatus.active.count}}</span>
                    </div>
                    <div>
                        <span>{{lang.manageStatus.terminated}}</span>
                        <span :title="deviceStatus.inactive"
                              class="device-inactive">{{deviceStatus.inactive.count}}</span>
                    </div>
                    <div>
                        <span>{{lang.manageStatus.obsolete}}</span>
                        <span :title="deviceStatus.deleted" class="device-deleted">{{deviceStatus.deleted.count}}</span>
                    </div>
                </div>
            </div>
        </transition>
    </div>

    <!-- 选择摄像头范围 -->
    <div class="distanceSelect" v-if="selectCameras.isShowDistance">
        <div class="button-left"
             style="cursor: pointer;display: flex;width: 13px;height: 50px;position: fixed;align-items: center;justify-content: center;"
             @click="changeShowRange" v-show="isShowCameraRange">
            <i class="el-icon-arrow-left"></i>
        </div>
        <div class="button-right"
             style="cursor: pointer;display: flex;width: 13px;height: 50px;position: fixed;align-items: center;justify-content: center;"
             @click="changeShowRange" v-show="!isShowCameraRange">
            <i class="el-icon-arrow-right"></i>
        </div>
        <div class='distanceSelect-area' v-show="!isShowCameraRange">
            <ul style="list-style:none;padding-inline-start: 0;margin-bottom: 0rem;padding:0;width:100%;">
                <li style="margin: 0 0.5rem 0.25rem 1rem;color: #ffed2a;cursor: none;">
                    {{lang.distanceSelect.cameraRange}}
                </li>
                <hr style="border-color: #ff8b00;margin-left: 10px;"/>
                <li v-for="(item, index) in selectCameras.rangedata" :key="index" @click="searchCameras(index)"
                    :class="{rangeActive: selectCameras.classMode[index]}">{{item}}{{lang.distanceSelect.minne}}
                </li>
            </ul>
        </div>
    </div>

    <!-- 查看设备属性信息 -->
    <el-dialog id="device-attributeDef-dialog"
               :title="lang.deviceAttributeDialog.dialogTitle + ' (' +deviceAttributeDialog.row.deviceName +')'"
               @mouseenter.native="StyleTitle()" :modal-append-to-body=true :append-to-body=true
               v-if="deviceAttributeDialog.dialog" v-dialogmove :close-on-press-escape=false :close-on-click-modal=false
               :visible.sync="deviceAttributeDialog.dialog" class="hw-dialog" width="50rem"
               @closed="deviceAttributeDialog.deviceAttrDatas=[]">
        <div class="operation-area">
            <div class="button" @click="refreshDeviceAttribute('DYNAMIC')">
                <i class="el-icon-refresh"></i>
            </div>
        </div>
        <el-row :gutter="5" class="row-title">
            <el-col :span="6">
                <span>{{lang.addEditDialog.attributeName}}</span>
            </el-col>
            <el-col :span="7">
                <span>{{lang.addEditDialog.attributeEncoding}}</span>
            </el-col>
            <el-col :span="4">
                <span>{{lang.addEditDialog.attributeType}}
                    <el-dropdown trigger="click" @command="refreshDeviceAttribute">
                        <i class="el-icon-caret-bottom"></i>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="DYNAMIC">{{lang.addEditDialog.dynamicAttribute}}
                            </el-dropdown-item>
                            <el-dropdown-item command="INSTANCE">{{lang.addEditDialog.instanceAttribute}}
                            </el-dropdown-item>
                            <el-dropdown-item command="DEFINITION">{{lang.addEditDialog.definitionAttribute}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </span>

            </el-col>
            <el-col :span="4">
                <span>{{lang.addEditDialog.attributeValue}}</span>
            </el-col>
            <el-col :span="3">
                <span>{{lang.addEditDialog.unit}}</span>
            </el-col>
        </el-row>
        <div class="attribute-area" id="deviceAttr">
            <el-row :gutter="5" v-for="(item, index) in deviceAttributeDialog.deviceAttrDatas" :key="index">
                <el-col :span="6">
                    <span :title="item.attrDef.attrLabel">{{item.attrDef.attrLabel}}</span>
                </el-col>
                <el-col :span="7">
                    <span :title="item.attrDef.code">{{item.attrDef.code}}</span>
                </el-col>
                <el-col :span="4">
                    <span :title="item.attrTypeDisplay">{{item.attrTypeDisplay}}</span>
                </el-col>
                <el-col :span="4" style="height: 19px">
                    <span :title="item.attrValue">{{item.attrValue}}</span>
                </el-col>
                <el-col :span="3">
                    <span :title="item.unitLabel">{{item.unit}}</span>
                </el-col>
            </el-row>
            <div class="attr-loading" v-if="deviceAttributeDialog.loading">
                <i class="el-icon-loading"></i>
            </div>
        </div>
    </el-dialog>

    <!-- 查看物模型绑点信息 -->
    <el-dialog id="device-deviceModel-dialog"
               :title="lang.deviceModelDialog.dialogTitle + ' (' +deviceModel.row.deviceName +')'"
               @mouseenter.native="StyleTitle()" :modal-append-to-body=true :append-to-body=true
               v-if="deviceModel.dialog"
               v-dialogmove :close-on-press-escape=false :close-on-click-modal=false :visible.sync="deviceModel.dialog"
               class="hw-dialog" width="50rem"
               @close="deviceModel.tab='attr';deviceModel.dataList = [];deviceModel.dialog=false">
        <div class="operation-area">
            <div class="button" @click="refreshDeviceModelBACnet()">
                <i class="el-icon-refresh"></i>
            </div>
        </div>
        <el-tabs v-model="deviceModel.tab" @tab-click="deviceModelChangeTab">
            <el-tab-pane :label="lang.deviceModelDialog.attr" name="attr"></el-tab-pane>
            <el-tab-pane :label="lang.deviceModelDialog.service" name="service"></el-tab-pane>
        </el-tabs>
        <el-row :gutter="5" class="row-title">
            <el-col :span="4">
                <span v-show="deviceModel.tab=='attr'">{{lang.deviceModelDialog.attrCode}}</span>
                <span v-show="deviceModel.tab=='service'">{{lang.deviceModelDialog.serviceCode}}</span>
            </el-col>
            <el-col :span="4">
                <span>{{lang.deviceModelDialog.objectIdentifier}}</span>
            </el-col>
            <el-col :span="4">
                <span>{{lang.deviceModelDialog.propertyIdentifier}}</span>
            </el-col>
            <el-col :span="4">
                <span>{{lang.deviceModelDialog.DDCNodeId}}</span>
            </el-col>
            <el-col :span="4">
                <span>{{lang.deviceModelDialog.pn}}</span>
            </el-col>
            <el-col :span="4">
                <span>{{lang.deviceModelDialog.pt}}</span>
            </el-col>
        </el-row>
        <div class="attribute-area">
            <el-row :gutter="5" v-for="(item, index) in deviceModel.dataList" :key="index">
                <el-col :span="4">
                    <span v-show="deviceModel.tab=='attr'">{{item.attrCode}}</span>
                    <span v-show="deviceModel.tab=='service'">{{item.serviceCode}}</span>
                </el-col>
                <el-col :span="4">
                    <span :title="item.objectIdentifier">{{item.objectIdentifier}}</span>
                </el-col>
                <el-col :span="4">
                    <span :title="item.propertyIdentifier">{{item.propertyIdentifier}}</span>
                </el-col>
                <el-col :span="4">
                    <span :title="item.DDCNodeId">{{item.DDCNodeId}}</span>
                </el-col>
                <el-col :span="4">
                    <span :title="item.pn">{{item.pn}}</span>
                </el-col>
                <el-col :span="4">
                    <span :title="item.pt">{{item.pt}}</span>
                </el-col>
            </el-row>
            <div class="attr-loading" v-if="deviceModel.loading">
                <i class="el-icon-loading"></i>
            </div>
        </div>
    </el-dialog>

    <!-- 查看传感器指标 -->
    <el-dialog
            id="deviceInfo"
            :title="deviceEnvSensorDialog.envSensor.basic.name"
            :visible.sync="deviceEnvSensorDialog.dialog"
            :modal-append-to-body=true v-dialogmove :append-to-body=true :close-on-press-escape=false
            :close-on-click-modal=false
            @close="closeEnvSensorDialog"
            width="25%" class="hw-dialog en-dialog">
        <div>
            <li v-for="item in deviceEnvSensorDialog.envSensor.attrs">
                {{item.name}}：{{item.value}}
            </li>
            <div class="flashTime-box">{{deviceEnvSensorDialog.envSensor.basic.flashtime}}</div>
        </div>
    </el-dialog>
</div>