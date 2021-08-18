<div id="hm_dispatch_work_order">
    <div class="dispatch_box">
        <ul class="dispatch_header">
            <li class="dispatch_cell dispatch_cell-3">工单编号</li>
            <li class="dispatch_cell dispatch_cell-8">公司</li>
            <li class="dispatch_cell dispatch_cell-1">等级</li>
            <li class="dispatch_cell dispatch_cell-2">报单人</li>
            <li class="dispatch_cell dispatch_cell-6">所属项目</li>
            <li class="dispatch_cell dispatch_cell-6">空间信息</li>
            <li class="dispatch_cell dispatch_cell-2">工单类型</li>
            <li class="dispatch_cell dispatch_cell-6">发起时间</li>
            <li class="dispatch_cell dispatch_cell-3">超时时长</li>
            <li class="dispatch_cell dispatch_cell-2">督办人</li>
            <li class="dispatch_cell dispatch_cell-13">工单描述</li>
        </ul>
        <div id="dispatchHtml"></div>
        <div class="dispatch_body">
            <ul class="dispatch_list">
                <li
                        v-for="(item, index) in dispatch_arr"
                        :key="index"
                        class="dispatch_cellrow"
                        :class="{'dispatch_cellall_isRed':item.desc.includes('水')||item.desc.includes('电')}"
                >
                    <span class="dispatch_cell dispatch_cell-3">{{item.orderId}}</span>
                    <span class="dispatch_cell dispatch_cell-8">{{ item.company }}</span>
                    <span class="dispatch_cell dispatch_cell-1 flex_level"><span
                            :class="{'dispatch_cell_isRed1':item.level==2}"></span></span>
                    <span class="dispatch_cell dispatch_cell-2">{{ item.proposer }}</span>
                    <span class="dispatch_cell dispatch_cell-6">{{ item.project }}</span>
                    <span class="dispatch_cell dispatch_cell-6">{{ item.space }}</span>
                    <span class="dispatch_cell dispatch_cell-2">{{ item.category }}</span>
                    <span class="dispatch_cell dispatch_cell-6">{{ item.startTime }}</span>
                    <span class="dispatch_cell dispatch_cell-3" :class="{'dispatch_cell_isRed':item.overtime!='--'}">{{ item.overtime }}</span>
                    <span class="dispatch_cell dispatch_cell-2">{{ item.supervise }}</span>
                    <span class="dispatch_cell dispatch_cell-13">{{ item.desc }}</span>
<!--                    <span class="dispatch_cell dispatch_cell-13">这是一个很长很长的测试包含了所有数据包括一个个内容会书店是的因此，地质学家能够很好的处理地震的任意数量的心思存储在一个系电力中，再放大到一个字典里</span>-->
                    <!--                    <span class="dispatch_cell dispatch_cell-9">-->
                    <!--                        <div id="wrap">-->
                    <!--                            <div id="inner">-->
                    <!--                                <span id="first">这是一个很长很长的测试包含了所有数据包括一个个内容会书店是的因此，地质学家能够很好的处理地震的任意数量的心思存储在一个系电力中，再放大到一个字典里</span>-->
                    <!--                                <span id="second">这是一个很长很长的测试包含了所有数据包括一个个内容会书店是的因此，地质学家能够很好的处理地震的任意数量的心思存储在一个系电力中，再放大到一个字典里</span>-->
                    <!--                            </div>-->
                    <!--                        </div>-->
                    <!--                    </span>-->
                </li>
            </ul>
        </div>
    </div>
</div>