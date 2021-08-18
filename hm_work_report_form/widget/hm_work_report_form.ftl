<div id="hm_work_report_form">
	<div class="work_report_form_box">
      <ul class="work_report_form_header">
        <li class="work_report_form_cell work_report_form_cell" >部门名称</li>
        <li class="work_report_form_cell work_report_form_cell" >服务子类型</li>
        <li class="work_report_form_cell work_report_form_cell" >总工单数</li>
        <li class="work_report_form_cell work_report_form_cell" >完成率</li>
        <li class="work_report_form_cell work_report_form_cell" >及时率</li>
        <li class="work_report_form_cell work_report_form_cell" >派单环节及时率</li>
        <li class="work_report_form_cell work_report_form_cell" >接单环节及时率</li>
        <li class="work_report_form_cell work_report_form_cell" >处理环节及时率</li>
        <li class="work_report_form_cell work_report_form_cell" >审核环节及时率</li>
        <li class="work_report_form_cell work_report_form_cell" >回访环节及时率</li>
      </ul>
      <div class="work_report_form_body">
		<ul class="work_report_form_left">
			<div class="work_department_name">
				<div class="department_engineer">工程部</div>
				<div class="department_customer">客服部</div>
				<div class="department_security">安保部</div>
			</div>
			<div class="work_department_name2">
				<div class="department_child">暖通</div>
				<div class="department_child">强电</div>
				<div class="department_child">弱电</div>
				<div class="department_child">综修</div>
				<div class="department_child">绿化</div>
				<div class="department_child">清洁</div>
				<div class="department_child">其他</div>
				<div class="department_child">安保</div>
				<div class="department_child">其他</div>
			</div>
		</ul>
		<ul class="work_report_form_list">
			<li
				v-for="(item, index) in Arr"
				:key="index"
          	>
			<span class="work_report_form_cell"  :class="{'work_report_form_cell_isRed':item.orderId>5}">{{item.total}}</span>
			<span class="work_report_form_cell"  :class="{'work_report_form_cell_isRed':item.orderId>5}">{{item.completion}}</span>         
			<span class="work_report_form_cell"  :class="{'work_report_form_cell_isRed':item.orderId>5}">{{item.timely}}</span>
			<span class="work_report_form_cell"  :class="{'work_report_form_cell_isRed':item.orderId>5}">{{item.dispatch}}</span>
			<span class="work_report_form_cell"  :class="{'work_report_form_cell_isRed':item.orderId>5}">{{item.receive}}</span>
			<span class="work_report_form_cell"  :class="{'work_report_form_cell_isRed':item.orderId>5}">{{item.handle}}</span>
			<span class="work_report_form_cell"  :class="{'work_report_form_cell_isRed':item.orderId>5}">{{item.examine}}</span>
         	<span class="work_report_form_cell"  :class="{'work_report_form_cell_isRed':item.orderId>5}">{{item.recall}}</span>
          </li>
        </ul>
      </div>
    </div>
</div>