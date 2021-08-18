<div id="IOC_PersonPass_Widget" v-cloak>
   <div class="template_content">
   
      <div class="rightContent">
         <!-- 搜索 -->
         <el-form class="conditions" label-position="top">
            <div class="row">
               <div class="col">
                  <div class="title">{{lang.organizationInputTitle}}</div>
                  <div class="hw-input">
                     <el-input v-model="orgName" :placeholder="lang.enterOrganizationName"></el-input>
                  </div>

               </div>
               <div class="col col1">
                  <div class="title">{{lang.organizationRegion}}</div>
                  <div class="hw-input">
                     <el-input v-model="region" :placeholder="lang.enterOrganizationRegion"></el-input>
                  </div>
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
            </div>

         </el-form>
   
         <!-- 表格 -->
         <div class="hw-table table">
            <el-table v-loading="loading" :data="organization" @row-click="hideImage">
               <el-table-column :label="lang.organizationName" prop="organizationName" show-overflow-tooltip></el-table-column>
               <el-table-column :label="lang.industry" prop="industry" show-overflow-tooltip ></el-table-column>
               <el-table-column :label="lang.organizationLevel" prop="comLevel" show-overflow-tooltip></el-table-column>
               <el-table-column :label="lang.establishDate" prop="establishDate" show-overflow-tooltip></el-table-column>
               <el-table-column :label="lang.comStatus" prop="comStatus" show-overflow-tooltip ></el-table-column>
               <el-table-column :label="lang.region" prop="region" show-overflow-tooltip></el-table-column>
               <el-table-column :label="lang.upload">
                  <el-button icon="el-icon-upload btn-onload" @click="dialogVisible = true"></el-button>
               </el-table-column>
            </el-table>
         </div>

         <el-dialog class="el-hw-dialog"
            title="上传图片"
            :visible.sync="dialogVisible"
            width="30%"
            :modal-append-to-body=true v-dialogmove :append-to-body=true :close-on-press-escape=false :close-on-click-modal=false
            :before-close="handleClose">
                <el-form :model="conference.formData" :rules="rules" ref="conference.formData" :label-position="labelPosition"
                  class="forms forms_flex">
               <el-row :gutter="20">
                  <el-col :span="12">
                     <el-form-item >
                        <el-upload class="avatar-uploader" action="" :http-request="uploadPhoto" :show-file-list="false"
                        :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" accept=".jpg,.jpeg">
                        <img v-if="conference.formData.showPhotoUrl" :src="conference.formData.showPhotoUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                     </el-form-item>
                  </el-col>
               </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
               <el-button @click="handleCloseDialog" class="cancel-button">取 消</el-button>
               <el-button @click="submitPic" class="submit-button">确 定</el-button>
               <!--  <el-button type="primary" @click="submitPic" class="submit-button">确 定</el-button>  -->
            </span>
         </el-dialog>
   
         <!-- 分页 -->
         <div class="pagination">
            <div class="hw-pagination">
               <el-pagination :current-page="pageNum" :page-sizes="[10, 20, 50, 100, 150]" :page-size="numPerPage" :total="totalCount"
                  layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange">
               </el-pagination>
            </div>
         </div>
      </div>
   </div>
</div>