<div id="hm_handle_work_order">
	<div class="handle_box">
      <ul class="handle_header">
        <li class="handle_cell handle_cell-3" >工单编号</li>
        <li class="handle_cell handle_cell-8" >公司</li>
        <li class="handle_cell handle_cell-1" >等级</li>
        <li class="handle_cell handle_cell-2" >处理人</li>
        <li class="handle_cell handle_cell-5" >所属项目</li>
        <li class="handle_cell handle_cell-6" >空间信息</li>
        <li class="handle_cell handle_cell-2" >工单类型</li>
        <li class="handle_cell-4" >
          <div>当前进度</div>
          <div class = "handle-state">
            <span class="handle-state-1">接单</span>
            <span class="handle-state-1">处理</span>
            <span class="handle-state-1">审核</span>
            <span class="handle-state-1">回访</span>
          </div>
        </li>
        <li class="handle_cell handle_cell-3" >超时时长</li>
        <li class="handle_cell handle_cell-2" >督办人</li>
        <li class="handle_cell handle_cell-13" >工单描述</li>
      </ul>
      <div id="defineHtml"></div>
      <div class="handle_body">
        <ul class="handle_list">
          <li
            v-for="(item, index) in arr"
            :key="index"
            class="handle_cellrow"
            :class="{'handle_cellall_isRed':item.desc.includes('水')||item.desc.includes('电')}"
          >
           <span class="handle_cell handle_cell-3">{{item.orderId}}</span>
           <span class="handle_cell handle_cell-8">{{ item.company }}</span>         
           <span class="handle_cell handle_cell-1 flex_handle_level"><span :class="{'handle_cell_isRed1':item.level==2}"></span></span>
           <span class="handle_cell handle_cell-2">{{ item.proposer }}</span>
           <span class="handle_cell handle_cell-5">{{ item.project }}</span>
           <span class="handle_cell handle_cell-6">{{ item.space }}</span>
           <span class="handle_cell handle_cell-2">{{ item.category }}</span>
            <span class="handle_cell handle_cell-4 handle-state" >
              <span class="handle_cell" :class="circle(item.state1)"></span>
              <span class="handle_cell" :class="circle(item.state2)"></span>
              <span class="handle_cell" :class="circle(item.state3)"></span>
              <span class="handle_cell" :class="circle(item.state4)"></span>
            </span>
           
           <span class="handle_cell handle_cell-3" :class="{'handle_cell_isRed':item.overTime!='--'}">{{ item.overTime }}</span>
           <span class="handle_cell handle_cell-2">{{ item.supervise }}</span>
           <span class="handle_cell handle_cell-13">{{ item.desc }}</span>
          </li>
        </ul>
      </div>
    </div>
</div>