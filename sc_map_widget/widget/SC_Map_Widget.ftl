<div id="Map_Module">
    <div class="box-module-gisMap" id="reader-gisMap" v-cloak>
        <div class="box-content-title" v-if="mapProps.showTitle">
            {{mapProps.title}}
        </div>
	    <div id="SC_Map_Widget">
		    <div id="map" class="map">
		    </div>
	    </div>
		<div class="floor-wrapper" v-show='isIndoorMap && mapProps.levelControl'>
		    <div class="icon el-icon-arrow-up" @click="selectFloor('up')" v-show="buildingInfo.floorList.length>1"></div>
			<div class="floors-box">
				<div class="icon" :class="{'icon-active':item.flag}" v-for="item in buildingInfo.floorList" @click="selectFloor(item.value)">{{item.label}}</div>
			</div>
			<div class="icon el-icon-arrow-down" @click="selectFloor('down')" v-show="buildingInfo.floorList.length>1"></div>
			<div class="icon el-icon-back" :title="$t('setting.backtooutdoor')" @click="switchOutdoor(true)"></div>
		</div>
		<div class="zoom-wrapper" v-show="mapProps.zoomControl">
			<div class="icon el-icon-plus" @click="zoomIn"></div>
			<div class="icon el-icon-minus" @click="zoomOut"></div>
			<div class="icon el-icon-location" :title="$t('setting.locationreset')" @click="resetMap"></div>
		</div>
		<div class="geo-wrapper" v-show="mapProps.geoMetryControl">
			<div class="icon" @click="enableSelectMode('frame')">
			   <div class="icon-rectangle"></div>
			</div>
			<div class="icon" @click="enableSelectMode('circle')">
				<div class="icon-circle"></div>
			</div>
			<div class="icon" @click="enableSelectMode('polygon')">
			   <div class="icon-pentagon"></div>
			</div>
			<div class="icon" @click="disableSelectMode">
				<div class="icon-back"></div>
			</div>
		</div>
	</div>
  <!--编辑弹窗-->
  <div id="edit-gisMap" style="display: none">
    <template id="edit-wrap">
      <div class="map-wrap">
        <div class="content">
          <div class="content-wrapper">
            <el-collapse v-model="activeCollapse" accordion>
              <el-collapse-item name='1'>
                <template slot="title">地图基本配置</template> 
                <div class="title-picker borleftline">
				  <div class="title-show pd-top">
				    <label class="label">配置来源</label>
				    <span>
					  <el-select v-model="mapProps.useGISBOConfig" placeholder="请选择">
					    <el-option v-for="item in configSources" :key="item.value" :label="item.label" :value="item.value"></el-option>
					  </el-select>                  
				    </span>
				  </div>
				  <div class="title-show pd-top">
				    <label class="label">地图类型</label>
				    <span>
					  <el-select v-model="mapProps.mapType" placeholder="请选择" @change="handleMapTypeChange" :disabled="mapProps.useGISBOConfig">
					    <el-option v-for="item in mapTypeOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
					  </el-select>                  
				    </span>
				  </div>
				  <div class="title-show pd-top" v-if="isThirdParty">
				    <label class="label">地图名称</label>
				    <span>
					  <el-select v-model="mapProps.mapCode" placeholder="请选择" @change="handleMapCodeChange" :disabled="mapProps.useGISBOConfig">
					    <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value"></el-option>
					  </el-select>                  
				    </span>
				  </div>				  
				  <div class="title-show pd-top" v-if="mapProps.mapType =='BAIDU_MAP'">
                    <label class="label">百度密钥</label>
                    <span style="width:73%">
                      <el-input type="password" v-model="mapProps.baiduKey" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top" v-if="mapProps.mapType =='GAODE_MAP'">
                    <label class="label">高德密钥</label>
                    <span style="width:73%">
                      <el-input type="password" v-model="mapProps.gaodeKey" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top" v-if="mapProps.mapType =='GOOGLE_MAP'">
                    <label class="label">谷歌密钥</label>
                    <span style="width:73%">
                      <el-input type="password" v-model="mapProps.googleKey" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top" v-if="mapProps.mapType =='GAODE_MAP'">
				    <label class="label">地图模式</label>
				    <span>
					  <el-select v-model="mapProps.viewMode" placeholder="请选择" :disabled="mapProps.useGISBOConfig">
					    <el-option v-for="item in viewModeOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
					  </el-select>                  
				    </span>
				  </div>
				  <div class="title-show pd-top" v-if="mapProps.mapType !='GAODE_MAP'">
				    <label class="label">地图模式</label>
				    <span>
					  <el-select v-model="mapProps.viewModeNew" placeholder="请选择" :disabled="mapProps.useGISBOConfig">
					    <el-option v-for="item in viewModeOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
					  </el-select>                  
				    </span>
				  </div>
				  <div class="title-show pd-top" v-if="!isThirdParty || (mapProps.mapType =='SUPER_3D_MAP')">
				    <label class="label">地图样式</label>
				    <span>
					  <el-select v-model="mapProps.mapStyle" placeholder="请选择" :disabled="mapProps.useGISBOConfig">
					    <el-option v-for="item in mapStyleOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
					  </el-select>                  
				    </span>
				  </div>
				  <div class="title-show pd-top"  v-if="!isThirdParty">
                    <label class="label">自定义地图样式</label>
                    <span style="width:240px">
                      <el-input v-model="mapProps.customMapStyle" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top">
                    <label class="label">地图中心经度</label>
                    <span>
                      <el-input type="number" v-model="mapProps.longitude" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top">
                    <label class="label">地图中心纬度</label>
                    <span>
                      <el-input type="number" v-model="mapProps.latitude" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top" v-if="mapProps.viewModeNew == '3D'">
                    <label class="label">地图中心高度</label>
                    <span>
                      <el-input type="number" v-model="mapProps.height" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="slider-picker pd-lr" v-if="mapProps.viewModeNew != '3D'">
                    <label class="label">地图缩放级别</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.zoomLevel" :min=1 :max=22 :disabled="mapProps.useGISBOConfig"></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.zoomLevel">
                      </div>
                    </div>                   
                  </div>
				  <div class="slider-picker pd-lr" v-if="mapProps.viewModeNew != '3D'">
                    <label class="label">最小缩放级别</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.minZoom" :min=1 :max=22 :disabled="mapProps.useGISBOConfig"></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.minZoom">
                      </div>
                    </div>                   
                  </div>
				  <div class="slider-picker pd-lr" v-if="mapProps.viewModeNew != '3D'">
                    <label class="label">最大缩放级别</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.maxZoom" :min=1 :max=22 :disabled="mapProps.useGISBOConfig"></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.maxZoom">
                      </div>
                    </div>                   
                  </div>
				  <!--<div class="slider-picker pd-lr" v-if="mapProps.viewModeNew == '3D'">
                    <label class="label">倾斜角</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.roll" :min=0 :max=360 :disabled="mapProps.useGISBOConfig"></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.roll">
                      </div>
                    </div>                   
                  </div>
				  <div class="slider-picker pd-lr" v-if="mapProps.viewModeNew == '3D' || (mapProps.viewMode == '3D' && mapProps.mapType =='GAODE_MAP')">
                    <label class="label">俯视角</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.threeDPitch" :min=0 :max=90 :disabled="mapProps.useGISBOConfig"></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.threeDPitch">
                      </div>
                    </div>                   
                  </div>
				  <div class="slider-picker pd-lr" v-if="mapProps.viewModeNew == '3D' || (mapProps.viewMode == '3D' && mapProps.mapType =='GAODE_MAP')">
                    <label class="label">旋转角</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.heading" :min=0 :max=360 :disabled="mapProps.useGISBOConfig"></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.heading">
                      </div>
                    </div>                   
                  </div> -->
				  
				  <div class="title-show pd-top" v-if="mapProps.viewModeNew == '3D'">
                    <label class="label">倾斜角</label>
                    <span>
                      <el-input type="number" v-model="mapProps.roll" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top" v-if="mapProps.viewModeNew == '3D' || (mapProps.viewMode == '3D' && mapProps.mapType =='GAODE_MAP')">
                    <label class="label">俯视角</label>
                    <span>
                      <el-input type="number" v-model="mapProps.threeDPitch" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top" v-if="mapProps.viewModeNew == '3D' || (mapProps.viewMode == '3D' && mapProps.mapType =='GAODE_MAP')">
                    <label class="label">旋转角</label>
                    <span>
                      <el-input type="number" v-model="mapProps.heading" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>
				  <div class="title-show pd-top" v-if="mapProps.viewModeNew == '3D' && (mapProps.mapType =='DIGIHAIL_MAP' || mapProps.mapType =='51VR_3D_MAP')">
                    <label class="label">相机视距</label>
                    <span>
                      <el-input type="number" v-model="mapProps.cameraDistance" :disabled="mapProps.useGISBOConfig"></el-input>
                    </span>
                  </div>				  
				  
				</div>
              </el-collapse-item>
			  
			  <el-collapse-item name='2'>
                <template slot="title">地图控件</template> 
				<div class="title-picker borleftline">
				  <el-collapse class="child-collapse visual-color" accordion>
					<el-collapse-item title="楼层控件">
					  <div class="title-picker borleftline">
					  
					    <div class="title-show pd-top">
						  <label class="label">是否展示</label>
						  <span>
							<el-switch v-model="mapProps.levelControl" active-color="#3899ec" inactive-color="#bdbdbd">
							</el-switch>
						  </span>
						</div>
						 <div class="title-show pd-top" v-show="mapProps.levelControl">
						  <label class="label">是否打开鼠标滑动提示</label>
						  <span>
							<el-switch v-model="mapProps.openIndoorHover" active-color="#3899ec" inactive-color="#bdbdbd">
							</el-switch>
						  </span>
						</div>
						<div class="title-show pd-top" v-show="mapProps.levelControl">
							<label class="label">横向位置</label>
							<span>
							  <el-select v-model="mapProps.levelLeft" placeholder="请选择">
								<el-option v-for="item in geoMetryLeftOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
							  </el-select>                  
							</span>
						  </div>
						  <div class="slider-picker pd-lr" v-show="mapProps.levelControl">
							<label class="label">横向百分比</label>
							<div class="slider-item">
							  <div class="ele-slider">
								<el-slider v-model="mapProps.levelHoriPercent" :min=0 :max=100></el-slider>
							  </div>
							  <div class="input-stepper">
								<input type="number" v-model.number="mapProps.levelHoriPercent">
							  </div>
							</div>                   
						  </div>
						  <div class="title-show pd-top" v-show="mapProps.levelControl">
							<label class="label">纵向位置</label>
							<span>
							  <el-select v-model="mapProps.levelTop" placeholder="请选择">
								<el-option v-for="item in geoMetryTopOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
							  </el-select>                  
							</span>
						  </div>
						  <div class="slider-picker pd-lr" v-show="mapProps.levelControl">
							<label class="label">纵向百分比</label>
							<div class="slider-item">
							  <div class="ele-slider">
								<el-slider v-model="mapProps.levelVertiPercent" :min=0 :max=100></el-slider>
							  </div>
							  <div class="input-stepper">
								<input type="number" v-model.number="mapProps.levelVertiPercent">
							  </div>
							</div>                   
						  </div>
						  <div class="title-show pd-top" v-show="mapProps.levelControl">
							<label class="label">背景色</label>
							<span class="x-color">
							  <el-color-picker v-model="mapProps.levelBackColor" show-alpha size="medium">
							  </el-color-picker>
							</span> 
						  </div>
						  <!-- <div class="title-show pd-top" v-show="mapProps.levelControl">
							<label class="label">楼层滚轮颜色</label>
							<span class="x-color">
							  <el-color-picker v-model="mapProps.levelScrollColor" show-alpha size="medium">
							  </el-color-picker>
							</span> 
						  </div> -->
						
						
					  </div>
					</el-collapse-item>
				  </el-collapse>
				  
				  <el-collapse class="child-collapse visual-color" accordion>
					<el-collapse-item title="框选控件">
					  <div class="title-picker borleftline">
						<div class="title-show pd-top">
						  <label class="label">是否展示</label>
						  <span>
							<el-switch v-model="mapProps.geoMetryControl" active-color="#3899ec" inactive-color="#bdbdbd">
							</el-switch>
						  </span>
						</div>
						<div class="title-show pd-top"  v-show="mapProps.geoMetryControl">
							<label class="label">横向位置</label>
							<span>
							  <el-select v-model="mapProps.geoMetryLeft" placeholder="请选择">
								<el-option v-for="item in geoMetryLeftOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
							  </el-select>                  
							</span>
						  </div>
						  <div class="slider-picker pd-lr" v-show="mapProps.geoMetryControl">
							<label class="label">横向百分比</label>
							<div class="slider-item">
							  <div class="ele-slider">
								<el-slider v-model="mapProps.geoHoriPercent" :min=0 :max=100></el-slider>
							  </div>
							  <div class="input-stepper">
								<input type="number" v-model.number="mapProps.geoHoriPercent">
							  </div>
							</div>                   
						  </div>
						  <div class="title-show pd-top"  v-show="mapProps.geoMetryControl">
							<label class="label">纵向位置</label>
							<span>
							  <el-select v-model="mapProps.geoMetryTop" placeholder="请选择">
								<el-option v-for="item in geoMetryTopOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
							  </el-select>                  
							</span>
						  </div>
						  <div class="slider-picker pd-lr" v-show="mapProps.geoMetryControl">
							<label class="label">纵向百分比</label>
							<div class="slider-item">
							  <div class="ele-slider">
								<el-slider v-model="mapProps.geoVertiPercent" :min=0 :max=100></el-slider>
							  </div>
							  <div class="input-stepper">
								<input type="number" v-model.number="mapProps.geoVertiPercent">
							  </div>
							</div>                   
						  </div>
						  <div class="title-show pd-top"  v-show="mapProps.geoMetryControl">
							<label class="label">背景色</label>
							<span class="x-color">
							  <el-color-picker v-model="mapProps.geoBackColor" show-alpha size="medium">
							  </el-color-picker>
							</span> 
						  </div>
						
						
					  </div>
					</el-collapse-item>
				  </el-collapse>
				  
				  <el-collapse class="child-collapse visual-color" accordion>
					<el-collapse-item title="缩放控件">
					  <div class="title-picker borleftline">
						<div class="title-show pd-top">
						  <label class="label">是否展示</label>
						  <span>
							<el-switch v-model="mapProps.zoomControl" active-color="#3899ec" inactive-color="#bdbdbd">
							</el-switch>
						  </span>
						</div>
						<div class="title-show pd-top"  v-show="mapProps.zoomControl">
							<label class="label">横向位置</label>
							<span>
							  <el-select v-model="mapProps.zoomLeft" placeholder="请选择">
								<el-option v-for="item in geoMetryLeftOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
							  </el-select>                  
							</span>
						  </div>
						  <div class="slider-picker pd-lr" v-show="mapProps.zoomControl">
							<label class="label">横向百分比</label>
							<div class="slider-item">
							  <div class="ele-slider">
								<el-slider v-model="mapProps.zoomHoriPercent" :min=0 :max=100></el-slider>
							  </div>
							  <div class="input-stepper">
								<input type="number" v-model.number="mapProps.zoomHoriPercent">
							  </div>
							</div>                   
						  </div>
						  <div class="title-show pd-top"  v-show="mapProps.zoomControl">
							<label class="label">纵向位置</label>
							<span>
							  <el-select v-model="mapProps.zoomTop" placeholder="请选择">
								<el-option v-for="item in geoMetryTopOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
							  </el-select>                  
							</span>
						  </div>
						  <div class="slider-picker pd-lr" v-show="mapProps.zoomControl">
							<label class="label">纵向百分比</label>
							<div class="slider-item">
							  <div class="ele-slider">
								<el-slider v-model="mapProps.zoomVertiPercent" :min=0 :max=100></el-slider>
							  </div>
							  <div class="input-stepper">
								<input type="number" v-model.number="mapProps.zoomVertiPercent">
							  </div>
							</div>                   
						  </div>
						  <div class="title-show pd-top"  v-show="mapProps.zoomControl">
							<label class="label">背景色</label>
							<span class="x-color">
							  <el-color-picker v-model="mapProps.zoomBackColor" show-alpha size="medium">
							  </el-color-picker>
							</span> 
						  </div>
						
						
					  </div>
					</el-collapse-item>
				  </el-collapse>
				

				  <el-collapse class="child-collapse visual-color" accordion>
					<el-collapse-item title="图层控件">
					  <div class="title-picker borleftline">
						<div class="title-show pd-top">
						  <label class="label">是否展示</label>
						  <span>
							<el-switch v-model="mapProps.mapTypeControl" active-color="#3899ec" inactive-color="#bdbdbd">
							</el-switch>
						  </span>
						</div>
						
					  </div>
					</el-collapse-item>
				  </el-collapse>
				  
                  <el-collapse class="child-collapse visual-color" accordion>
					<el-collapse-item title="3D控件">
					  <div class="title-picker borleftline">
						<div class="title-show pd-top">
						  <label class="label">是否展示</label>
						  <span>
							<el-switch v-model="mapProps.threeDControl" active-color="#3899ec" inactive-color="#bdbdbd">
							</el-switch>
						  </span>
						</div>
						 <div class="title-show pd-top" v-show="mapProps.threeDControl">
							<label class="label">3D控件大小</label>
							<span>
							  <el-select v-model="mapProps.threeDControlSize" placeholder="请选择">
								<el-option v-for="item in threeDCtrlSizeOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
							  </el-select>                  
							</span>
						  </div>
						  
					  </div>
					</el-collapse-item>
				  </el-collapse>
				  
				  
				</div>
			  </el-collapse-item>
			  
			  <el-collapse-item name='3'>
                <template slot="title">图层管理</template> 
				<div class="title-picker borleftline">
				 
				  <el-collapse class="child-collapse visual-color" accordion>
					<el-collapse-item title="基础图层">
					  <div class="title-picker borleftline">
						<div class="title-show pd-top">
						  <label class="label">是否展示</label>
						  <span>
							<el-switch v-model="mapProps.showBaseLayer" active-color="#3899ec" inactive-color="#bdbdbd">
							</el-switch>
						  </span>
						</div>
					  </div>
					</el-collapse-item>
				  </el-collapse>
				  
				  <el-collapse class="child-collapse visual-color" accordion>
					<el-collapse-item title="图片图层">
					  <div class="title-picker borleftline">
						<div class="title-show pd-top">
						  <label class="label">是否展示</label>
						  <span>
							<el-switch v-model="mapProps.showImageLayer" active-color="#3899ec" inactive-color="#bdbdbd">
							</el-switch>
						  </span>
						</div>
						<div class="title-show pd-top"  v-show="mapProps.showImageLayer">
							<label class="label">图片URL</label>
							<span style="width:240px">
							  <el-input v-model="mapProps.imageUrl"></el-input>                 
							</span>
						  </div>
						  <div class="title-show pd-top"  v-show="mapProps.showImageLayer">
							<label class="label">图片左下角经度</label>
							<span>
							  <el-input type="number" v-model="mapProps.imgSwlongitude"></el-input>
							</span>
						  </div>
						  <div class="title-show pd-top"  v-show="mapProps.showImageLayer">
							<label class="label">图片左下角纬度</label>
							<span>
							  <el-input type="number" v-model="mapProps.imgSwlatitude"></el-input>
							</span>
						  </div>
						  <div class="title-show pd-top"  v-show="mapProps.showImageLayer">
							<label class="label">图片右上角经度</label>
							<span>
							  <el-input type="number" v-model="mapProps.imgNelongitude"></el-input>
							</span>
						  </div>
						  <div class="title-show pd-top"  v-show="mapProps.showImageLayer">
							<label class="label">图片右上角纬度</label>
							<span>
							  <el-input type="number" v-model="mapProps.imgNelatitude"></el-input>
							</span>
						  </div>
						
						
					  </div>
					</el-collapse-item>
				  </el-collapse>
				

				</div>
			  </el-collapse-item>
			  
			  <el-collapse-item name='4'>
                <template slot="title">组件标题</template> 
                <div class="title-picker borleftline">
                  <div class="title-show pd-top">
                    <label class="label">设置标题</label>
                    <span>
                      <el-switch v-model="mapProps.showTitle" active-color="#3899ec" inactive-color="#bdbdbd">
                      </el-switch>
                    </span>
                  </div>
                  <div class="title-show pd-top"  v-show="mapProps.showTitle">
                    <label class="label">内容</label>
                    <span>
                      <el-input v-model="mapProps.title" placeholder="请输入标题内容"></el-input>
                    </span>
                  </div>
    
                  <div class="title-show pd-top"  v-show="mapProps.showTitle">
                    <label class="label">位置选择</label>
                    <span>
                      <el-select v-model="mapProps.titlePosition" placeholder="请选择">
                        <el-option v-for="item in titleTileOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
                      </el-select>                  
                    </span>
                  </div>    
                  
                  <div class="title-show pd-top"  v-show="mapProps.showTitle">
                    <label class="label">背景色</label>
                    <span class="x-color">
                      <el-color-picker v-model="mapProps.titleBackColor" show-alpha size="medium">
                      </el-color-picker>
                    </span> 
                  </div>
                  <div class="slider-picker pd-lr" v-show="mapProps.showTitle">
                    <label class="label">文本字体大小</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.titleFontSize"></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.titleFontSize">
                      </div>
                    </div>                   
                  </div>
                  <div class="title-show pd-top" v-show="mapProps.showTitle">
                    <label class="label">字体系列</label>
                    <span>
                      <el-select v-model="mapProps.titleFontFamily" placeholder="请选择">
                        <el-option v-for="item in labelFontFamilyOpt" :key="item.value" :label="item.label" :value="item.value"></el-option>
                      </el-select>                  
                    </span>
                  </div>
                  <div class="title-show pd-top"  v-show="mapProps.showTitle">
                    <label class="label">文本颜色</label>
                    <span class="x-color">
                      <el-color-picker v-model="mapProps.titleColor" show-alpha size="medium">
                      </el-color-picker>
                    </span> 
                  </div>
                </div>                                                   
              </el-collapse-item>
			  <el-collapse-item name='5'>
                <template slot="title">边框圆角</template>
                <div class="title-picker borleftline">
                  <div class="slider-picker pd-lr">
                    <label class="label">左上角弧度</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.borderTopLeftRadius" :min=0 :max=500></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.borderTopLeftRadius">
                      </div>
                    </div>                   
                  </div>
                  <div class="slider-picker pd-lr">
                    <label class="label">左下角弧度</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.borderBottomLeftRadius" :min=0 :max=500></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.borderBottomLeftRadius">
                      </div>
                    </div>                   
                  </div>
                  <div class="slider-picker pd-lr">
                    <label class="label">右上角弧度</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.borderTopRightRadius" :min=0 :max=500></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.borderTopRightRadius">
                      </div>
                    </div>                   
                  </div>
                  <div class="slider-picker pd-lr">
                    <label class="label">右下角弧度</label>
                    <div class="slider-item">
                      <div class="ele-slider">
                        <el-slider v-model="mapProps.borderBottomRightRadius" :min=0 :max=500></el-slider>
                      </div>
                      <div class="input-stepper">
                        <input type="number" v-model.number="mapProps.borderBottomRightRadius">
                      </div>
                    </div>                   
                  </div>
                </div> 
              </el-collapse-item>
			  <el-collapse-item name='6'>
                <template slot="title">
                  组件背景  
                </template> 
                <div class="title-picker borleftline">
                  <div class="title-show pd-top">
                    <label class="label">颜色设置</label>
                    <span>
                      <el-color-picker v-model="mapProps.bgColor" show-alpha size="medium">
                      </el-color-picker>
                    </span>
                  </div>              
                </div>                                                   
              </el-collapse-item>
			</el-collapse>  
          </div>
        </div>
      </div>
    </template>
  </div>
  <!--编辑弹窗-->
</div>