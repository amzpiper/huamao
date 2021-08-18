<div id="HW_Camera_Control_Widget" class="HW_Camera_Control_Widget themeClass" :style="{width: autoWidth, height: autoHeight, position: position, top: vTop + '!important', bottom: vBottom + '!important', left: vLeft + '!important', right: vRight + '!important', 'zIndex': 999}" v-cloak>
  <div class="liveAndReplay">
    <!-- <div @click="replayMode" :class="replayClass"><div></div>{{lang.playBack}}</div> -->
    <div @click="liveMode" :class="liveClass"><div></div>{{lang.liveVideo}}</div>
  </div>
  <div id="closeli_video" class="closeli_video" :style="{height: videoHeight}">
    <div style="height:100%;width:100%;" class="closeit-video-player">
        <div :style="playStyle" style="position: relative;background: rgba(35,43,54,.9);" >
            <div v-if="0 == closeitUrls.length" style="height: 100%;background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAAA0CAYAAAF5pM+DAAAAAXNSR0IArs4c6QAABD5JREFUeAHtnAlX1DAUhRkEFVfcl///24QjoiIgssh4v9LX06ZLmjTM1DPJOUOWvtzc3KZvskxZbCksl8vPxB3harFYfLPy7QFDbB6aIXbblhmKDXCUsQGlN1Ynv4AO8qE1MxRTYSHyj2X0usvQEO0ayJ2GGJgKlt4hMRRUAcCP2IxR44GBjTE2Wz+yOnlt1l7OGKKKuO8g3TPlX1jt0NiVl/rC3IdFNKhLQoDVYzGqey6Amxfgrsre1cuD7ki9oi+dCvjGbSiJFLqBSwEXT51k+aT0YkFLynxQVI1YykaErwJsMbV6DLfqTlphQHwo8FvXHsypGjeGqgB3jWgSjWEswEJbY58E2FgaKPFUKepYjXQGruSYtxSlTz6v6CqRjLHAT8oGCvxJwAL6WWdJugS/MSfUeGpc43vKX4rEcSg2zi3GY4a202f/S6TP+i5aed0N4YJC3bvhpIh7XaBI7quBJ24jvRVcw1XkRbI1h3DbnfRwuGBT8mPIgj8bwmM7mwmPVSrWLiscq5z88XX5bcYUuzfMyq3BUqQPiOU14PaedD1QeKVPtc1Qv7iC9GVfGyLO2sMWMy+VfoqtzSUg/JaCFYbONYuvfSNMzFfhnq/CxOuMzzOpdxqLw+TnkSq/iQWYUO9AxAcfsC7sqUvRLsyxZUt7wHwVJCojgCnwxTq9RDEcR5BlxsZwJeytk/AdhYG/Uha31uDYyAzUXeml2hBotTs7wiJbHwLzJtw1BFzGs1FYZEdtnOXZmnsLU+ezwqkVdfGywq4iqfNZ4dSKunhZYVeRgDxrS2+YjcKazHMw/8PHeDaEISrSF4qKZX4f8VkRLkmzdGJ5Xx1318nPjrCRE+kjpVtDZLaEId41RCDcOoDFeAWhcZ7V155I2xD5I5vvtpHSWuz1ASQqPxeRkxisaqmtGT/bVSynZ7MKiemQpw4nVqfcNY9dssts/DCMGRGzfv6S9fgOCJGjt/d8XKQph2HoecVo5RdWmySuurv1XCLcSGS+V5OEUtRXAmt4ADK4hk0M9HuSwBIVF8vRQOt82QRtqG2FGxJX3z+h/ZWwCIqwXoxNFjhI1z4X4APJAg8oNMYFDFQvLmWBOxSSsBxUMmX1uoCO6o2iLHBDjuIwnikWs4EkYdOmZ0lECwHJAoeoFWGbBY4QLaRKFjhErQjbLHCEaCFVssAhakXYZoEjRAupkgUOUSvCNgvcFi3pZnwW2BFYe8T8Spmz11FnWk71VjYvlVuSFKeXjGLO4E60L4FGLJ1ZQgeHLLBHsnJEc8bNSwPBm0BZYI/A9cvlEdNFuY3Jq8vFSw51GzeNwH/1Wefrfi6nVeXpd1SQ0KNdCKfKk/6RQhTD9VdCIF75jxa5qwsdLuS22FDWBV4y4XR58gZzV8MzK+N3cMflKLx3ag1BS9+C2DhzTl3/d9fBSOVXY4j6W6L2/pMKXb+X8A/y8Rwlx9hAdgAAAABJRU5ErkJggg==');background-repeat: no-repeat; background-position: center;">
                <div style="position: absolute;top: calc(50% + 36px);left: calc(50% - 38px);font-size: 16px;color: #636569;">{{lang.noVideoSource}}</div>
            </div>
	        <div v-else> 
            <div v-if="videoMediaType == 'HTML'" id="HTML">
            </div>
            <div v-else id="videoJs">
            </div>
	        </div> 
        </div>
    </div>
  </div>
  <div class="video-slider" v-if="!isLive"  @mousedown="handlePause? '': pause()">
    <el-slider :max="(flvPlaybackData.originEndTime-flvPlaybackData.originStartTime)/1000" :step='1' v-model="playbackSlider.played" :format-tooltip="formatTooltip" @change="videoSeeked" :disabled="isSliderDragDisable"></el-slider>
    <span class="slider-time">{{playbackSlider.playedTime}} / {{playbackSlider.totalTime}}</span>
  </div>
  <div class="cameraControlCircle" style="height:4rem;">
    <div class="hw-card ">
        <el-card class="hw-card__body">
          <!-- ########################## 实况 ################################### -->
          <div class="left-operate live" v-if="isLive" :class="{'btn-disable': !isVideoLoadCompleted4Lives[activeWin]}">
            <el-button-group class="buttons" style="margin: 0 3rem 0 1rem;">
                <el-button  :title="lang.turnUp"
                round :disabled="isPtzDisabled()"
                type="primary">
                <i class="hw-icon-up btn" @mousedown="selectItem(1)"  @mouseup="stop()" @mouseleave="stop()"></i>
              </el-button>
              <el-button   :title="lang.turnDown"
                round :disabled="isPtzDisabled()"
                type="primary">
                <i class="hw-icon-down btn" @mousedown="selectItem(2)"  @mouseup="stop()" @mouseleave="stop()"></i>
              </el-button>
              <el-button  :title="lang.turnLeft"
                round :disabled="isPtzDisabled()"
                type="primary">
                <i class="hw-icon-left btn" @mousedown="selectItem(3)"  @mouseup="stop()" @mouseleave="stop()"></i>
              </el-button>
              <el-button  :title="lang.turnRight"
                round :disabled="isPtzDisabled()"
                type="primary">
                <i class="hw-icon-right btn" @mousedown="selectItem(4)"  @mouseup="stop()" @mouseleave="stop()"></i>
              </el-button>
              <el-button  :title="lang.zoomIn"
               :disabled="!isVideoLoadCompleted4Lives[activeWin]"
                type="primary">
                <i class="hw-icon-zoom-out btn" @mousedown="zoomIn()" @mouseup="stop()" @mouseleave="stop()"></i>
              </el-button>
              <el-button  :title="lang.zoomOut"
               :disabled="!isVideoLoadCompleted4Lives[activeWin]"
                round
                type="primary">
                <i class="hw-icon-zoom-in btn" @mousedown="zoomOut()" @mouseup="stop()" @mouseleave="stop()"></i>
              </el-button>
              <el-button :title="lang.screenshot"
              :disabled="!isVideoLoadCompleted4Lives[activeWin]"
                round
                type="primary" @click="cut">
                <i class="hw-icon-camera btn"></i>
              </el-button>
              <el-button   :title="lang.fullScreen" 
               :disabled="!isVideoLoadCompleted4Lives[activeWin]"
              style="position: inherit;"
                round
                type="primary" @click="fullScreen">
                <i class="hw-icon-cut btn"></i>
              </el-button>


            <el-button    style="position: inherit; color:#cfd2e6;" 
            :disabled="!isVideoLoadCompleted4Lives[activeWin]"
              type="primary" @click="switchfill"        
                v-model="isfill" v-show="isfill" v-if="isshowfill">
            {{lang.fill}}
            </el-button>

             <el-button    style="position: inherit; color:#cfd2e6;" 
             :disabled="!isVideoLoadCompleted4Lives[activeWin]"
              type="primary" @click="switchfill"        
                v-model="isfill" v-show="!isfill" v-if="isshowfill">
            {{lang.standard}}
            </el-button>
      
    



         


            </el-button-group>
          </div>
          <!-- ########################## 录像 ################################### -->
          <div class="left-operate playback"  :class="{'btn-disable': !isVideoLoadCompleted}" v-else>
            <el-button-group class="buttons" style="margin: 0 3rem 0 1rem;">
              <el-button :title="lang.play"
                round
                type="primary" v-if="!isPlay[activeWin]" @click="resume">
                <i class="hw-icon-play btn"></i>
              </el-button>
              <el-button :title="lang.pause"
                round
                type="primary" v-if="isPlay[activeWin]" @click="pause">
                <i class="hw-icon-pause btn"></i>
              </el-button>
              <el-button :title="lang.stop"
                round
                type="primary" @click="cancelBtn">
                <i class="ivu-icon ivu-icon-stop btn" style="background:rgb(180,183,200)"></i>
              </el-button>
              <el-button :title="lang.slowForward"
                round
                type="primary" @click="playbackRate(1)">
                <i class="hw-icon-subspeed btn"></i>
              </el-button>
              <span id="rate" style="text-align: center;">1X</span>
              <el-button :title="lang.fastForward"
                round
                type="primary" @click="playbackRate(0)">
                <i class="hw-icon-addspeed btn" :style="fastForward"></i>
              </el-button>
              <el-button :title="lang.screenshot"
                round
                type="primary" @click="cut">
                <i class="hw-icon-camera btn"></i>
              </el-button>
              <el-button :title="lang.fullScreen"
                    round
                    type="primary" @click="fullScreen">
                    <i class="hw-icon-cut btn"></i>
                </el-button>

            <el-button   style="color:#cfd2e6;"
             :disabled="!isVideoLoadCompleted"
                round
                type="primary" @click="switchfill" 
             v-show="isfill" v-if="isshowfill">
                    {{lang.fill}}
            </el-button>

             <el-button     style="color:#cfd2e6;"
             this.isVideoLoadCompleted
               :disabled="!isVideoLoadCompleted"
                round 
                type="primary" @click="switchfill" 
              v-show="!isfill" v-if="isshowfill">
                    {{lang.standard}}
            </el-button>
      


            </el-button-group>
            <div class="time-selector">
                <template>
                <div class="block">
                    <el-date-picker style="text-align:center"
                        v-model="playbackParamOrigin"
                        type="datetimerange"
                        :picker-options="pickerBeginDateBefore"
                        :start-placeholder="lang.startTime"
                        :end-placeholder="lang.endTime"
                        :default-time="['12:00:00']">
                    </el-date-picker>
                </div>
                </template>
            </div>
            <div class="button-control">
              <div class="button-playback" @click="playback">{{lang.playBack}}</div>
              <div class="button-reset" @click="resetPlaybackParam">{{lang.reset}}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <el-dialog
     :visible.sync="isShowDialog"
     width="30%"
     class="hw-ok-check" style="z-index:3"
     :show-close="!isShowTip"
     center>
     <div class="hw-icon-circle-check" style="z-index:1000">
       <img :src="dialogPng" alt="">
       <p>{{ dialogMsg }}</p>
     </div>
   </el-dialog>
</div>
