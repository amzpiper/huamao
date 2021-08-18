<div id="IOC_PersonPass_Widget" v-cloak>
   <div class="template_content">
   
      <div class="rightContent">
         <!-- 搜索 -->
         <el-form class="conditions" label-position="top">
            <div class="row">
               <div class="col">
                  <div class="title">{{lang.personNameInputTitle}}</div>
                  <div class="hw-input">
                     <el-input v-model="name" :placeholder="lang.enterPersonName"></el-input>
                  </div>
               </div>
               <div class="col">
                  <div class="title">{{lang.companyNameInputTitle}}</div>
                  <div class="hw-input">
                     <el-input v-model="orgName" :placeholder="lang.enterOrganizationName"></el-input>
                  </div>
               </div>
               <div class="col">
                  <div class="col buttons">
                  <div class="title">&nbsp;</div>
                  <div class="f_r">
                        <div class="info-button hw-button hw-button--info">
                            <el-button type="info" style="width: 8rem;" @click="pageNum = 1;searchTable()">{{lang.searchBtn}}</el-button>
                        </div>     
                        <div class="hw-button hw-button--ghost">
                            <el-button type="ghost" style="width: 8rem;" @click="reset">{{lang.resetBtn}}</el-button>
                        </div>                     
                  </div>
               </div>
               </div>
            </div>
   
            <!--  <div class="row">
               <div class="col">

               </div>
               <div class="col">
                  
               </div>
               <div class="col buttons">
                  <div class="title">&nbsp;</div>
                  <div class="f_r">
                        <div class="info-button hw-button hw-button--info">
                            <el-button type="info" style="width: 8rem;" @click="pageNum = 1;searchTable()">{{lang.searchBtn}}</el-button>
                        </div>     
                        <div class="hw-button hw-button--ghost">
                            <el-button type="ghost" style="width: 8rem;" @click="reset">{{lang.resetBtn}}</el-button>
                        </div>                     
                  </div>
               </div>
            </div>  -->
   
            <!--  <div class="row" style="display: block">    -->
                <!-- <div class="hw-input" v-if="doFlag == true">
                    <el-switch style="float: right;" id="parkFlag" v-model="parkFlag" active-color="#4b4d73" inactive-color="#27283f"  @change="parkFlagChange"></el-switch>
                    <span style="float: right; margin-left: 24px; color: #fff;">{{lang.parkFlagPickTitle}}：</span>
                </div> -->

                <!--  <div class="hw-input">
                    <el-switch style="float: right;" :disabled="disabled" :data="getSwitch" id="doFlag" v-model="doFlag" active-color="#4b4d73" inactive-color="#27283f"  @change="doFlagChange"></el-switch>
                    <span style="float: right; color: #fff;">{{lang.doFlagPickTitle}}：</span>
                </div>  -->
            <!--  </div>  -->
         </el-form>
   
         <!-- 表格 -->
         <div class="hw-table table">
            <el-table v-loading="loading" :data="getWay" @row-click="hideImage">
               <el-table-column :label="lang.passTimeColumn" prop="time" show-overflow-tooltip></el-table-column>
               <el-table-column :label="lang.personNameColumn" prop="name" show-overflow-tooltip ></el-table-column>
               <el-table-column :label="lang.personTypeColumn" prop="type" show-overflow-tooltip></el-table-column>
               <el-table-column :label="lang.identificationMethodColumn" prop="way" show-overflow-tooltip></el-table-column>
               <el-table-column :label="lang.accessArea" prop="guard" show-overflow-tooltip ></el-table-column>
               <el-table-column :label="lang.accessCompany" prop="location" show-overflow-tooltip></el-table-column>
               <!--  <el-table-column :label="lang.trafficDirection" prop="accessLocation" show-overflow-tooltip></el-table-column>
               <el-table-column :label="lang.passAttachmentColumn"  class-name="handle">
                  <template slot-scope="scope">
                     <div class="tableHandle">
                        <i v-show="!scope.row.showUrl" @click.stop="showImage(scope.row)" class="el-icon-view"></i>
                        <span v-if="scope.row.url&&(scope.row.url.indexOf('https:')>-1||scope.row.url.indexOf('http:')>-1)&&scope.row.showUrl"><img style="width: 100%; object-fit: contain;" v-bind:src="scope.row.url" /></img></span>
                        <span v-else-if="scope.row.url&&(scope.row.url.indexOf('https:')<0||scope.row.url.indexOf('http:')<0)&&scope.row.showUrl">{{scope.row.url}}</span>
                     </div>
                  </template>
               </el-table-column>  -->
            </el-table>
         </div>
   
         <!-- 分页 -->
         <div class="pagination" v-if="pagination">
            <div class="hw-pagination">
               <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum" :page-sizes="[10, 20, 50, 100, 150]" :page-size="numPerPage" layout="total, sizes, prev, pager, next, jumper" :total="totalCount"></el-pagination>
            </div>
         </div>
      </div>
   </div>
</div>