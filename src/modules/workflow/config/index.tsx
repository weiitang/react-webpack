export const content = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:flowable="http://flowable.org/bpmn" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <process id="Process_1" isExecutable="false">
    <startEvent id="StartEvent_1" name="开始">
      <outgoing>Flow_1r6uf7u</outgoing>
    </startEvent>
    <parallelGateway id="Gateway_0hm8mpu">
      <incoming>Flow_1nm8834</incoming>
      <outgoing>Flow_0p14dt7</outgoing>
      <outgoing>Flow_1ar8ja6</outgoing>
    </parallelGateway>
    <sequenceFlow id="Flow_0p14dt7" sourceRef="Gateway_0hm8mpu" targetRef="legal_submit" />
    <sequenceFlow id="Flow_1ar8ja6" sourceRef="Gateway_0hm8mpu" targetRef="dl_submit" />
    <userTask id="dl_reviewing" name="DL审核">
      <extensionElements>
        <flowable:ma name="completeApprovalRoles">LGDB.DL,LGDB.MEMBER</flowable:ma>
        <flowable:ma name="isSkippable">false</flowable:ma>
        <flowable:ma name="completeApprovalType">or</flowable:ma>
        <flowable:ma name="isOverridable">false</flowable:ma>
        <flowable:ma name="isRollbackable">false</flowable:ma>
        <flowable:ma name="isSuspendable">true</flowable:ma>
        <flowable:ma name="isAutoStart">true</flowable:ma>
        <flowable:ma name="isAutoContinue">true</flowable:ma>
        <flowable:ma name="isUncompleteTrigger">false</flowable:ma>
      </extensionElements>
      <incoming>Flow_1jza7o6</incoming>
      <outgoing>Flow_0ms1711</outgoing>
    </userTask>
    <parallelGateway id="Gateway_048k9zk">
      <incoming>Flow_1s3vgb2</incoming>
      <incoming>Flow_15ot7q6</incoming>
      <outgoing>Flow_1sisxgh</outgoing>
      <outgoing>Flow_1jza7o6</outgoing>
      <outgoing>Flow_0buf5yv</outgoing>
    </parallelGateway>
    <userTask id="legal_reviewing" name="法务审核">
      <extensionElements>
        <flowable:ma name="completeApprovalRoles">LGDB.LEGAL</flowable:ma>
        <flowable:ma name="isSkippable">false</flowable:ma>
        <flowable:ma name="completeApprovalType">or</flowable:ma>
        <flowable:ma name="isOverridable">false</flowable:ma>
        <flowable:ma name="isRollbackable">false</flowable:ma>
        <flowable:ma name="isSuspendable">true</flowable:ma>
        <flowable:ma name="isAutoStart">true</flowable:ma>
        <flowable:ma name="isAutoContinue">true</flowable:ma>
        <flowable:ma name="isUncompleteTrigger">false</flowable:ma>
      </extensionElements>
      <incoming>Flow_0buf5yv</incoming>
      <outgoing>Flow_0t8jy8t</outgoing>
    </userTask>
    <userTask id="finance_reviewing" name="财务审批">
      <extensionElements>
        <flowable:ma name="completeApprovalRoles">LGDB.FINANCE</flowable:ma>
        <flowable:ma name="isSkippable">false</flowable:ma>
        <flowable:ma name="completeApprovalType">or</flowable:ma>
        <flowable:ma name="isOverridable">false</flowable:ma>
        <flowable:ma name="isRollbackable">false</flowable:ma>
        <flowable:ma name="isSuspendable">true</flowable:ma>
        <flowable:ma name="isAutoStart">true</flowable:ma>
        <flowable:ma name="isAutoContinue">true</flowable:ma>
        <flowable:ma name="isUncompleteTrigger">false</flowable:ma>
      </extensionElements>
      <incoming>Flow_1sisxgh</incoming>
      <outgoing>Flow_1ikx91i</outgoing>
    </userTask>
    <sequenceFlow id="Flow_1sisxgh" sourceRef="Gateway_048k9zk" targetRef="finance_reviewing" />
    <parallelGateway id="Gateway_1537ypr">
      <incoming>Flow_0ms1711</incoming>
      <incoming>Flow_1ikx91i</incoming>
      <incoming>Flow_0t8jy8t</incoming>
      <outgoing>Flow_1pnzngw</outgoing>
    </parallelGateway>
    <sequenceFlow id="Flow_0ms1711" sourceRef="dl_reviewing" targetRef="Gateway_1537ypr" />
    <sequenceFlow id="Flow_1ikx91i" sourceRef="finance_reviewing" targetRef="Gateway_1537ypr" />
    <sequenceFlow id="Flow_0t8jy8t" sourceRef="legal_reviewing" targetRef="Gateway_1537ypr" />
    <endEvent id="Event_1tusbpq" name="结束">
      <incoming>Flow_1pnzngw</incoming>
    </endEvent>
    <sequenceFlow id="Flow_1pnzngw" sourceRef="Gateway_1537ypr" targetRef="Event_1tusbpq" />
    <sequenceFlow id="Flow_1s3vgb2" sourceRef="legal_submit" targetRef="Gateway_048k9zk" />
    <sequenceFlow id="Flow_15ot7q6" sourceRef="dl_submit" targetRef="Gateway_048k9zk" />
    <sequenceFlow id="Flow_1jza7o6" sourceRef="Gateway_048k9zk" targetRef="dl_reviewing" />
    <sequenceFlow id="Flow_0buf5yv" sourceRef="Gateway_048k9zk" targetRef="legal_reviewing" />
    <userTask id="legal_submit" name="法务/律师填写">
      <extensionElements>
        <flowable:ma name="completeApprovalRoles">LGDB.LEGAL</flowable:ma>
        <flowable:ma name="isSkippable">false</flowable:ma>
        <flowable:ma name="completeApprovalType">or</flowable:ma>
        <flowable:ma name="isOverridable">false</flowable:ma>
        <flowable:ma name="isRollbackable">false</flowable:ma>
        <flowable:ma name="isSuspendable">true</flowable:ma>
        <flowable:ma name="isAutoStart">true</flowable:ma>
        <flowable:ma name="isAutoContinue">true</flowable:ma>
        <flowable:ma name="isUncompleteTrigger">false</flowable:ma>
      </extensionElements>
      <incoming>Flow_0p14dt7</incoming>
      <outgoing>Flow_1s3vgb2</outgoing>
    </userTask>
    <userTask id="dl_submit" name="DL/项目普通成员填写">
      <extensionElements>
        <flowable:ma name="completeApprovalRoles">LGDB.DL,LGDB.MEMBER</flowable:ma>
        <flowable:ma name="isSkippable">false</flowable:ma>
        <flowable:ma name="completeApprovalType">or</flowable:ma>
        <flowable:ma name="isOverridable">false</flowable:ma>
        <flowable:ma name="isRollbackable">false</flowable:ma>
        <flowable:ma name="isSuspendable">true</flowable:ma>
        <flowable:ma name="isAutoStart">true</flowable:ma>
        <flowable:ma name="isAutoContinue">true</flowable:ma>
        <flowable:ma name="isUncompleteTrigger">false</flowable:ma>
      </extensionElements>
      <incoming>Flow_1ar8ja6</incoming>
      <outgoing>Flow_15ot7q6</outgoing>
    </userTask>
    <receiveTask id="create_legal_database" name="创建legal database">
      <extensionElements>
        <flowable:ma name="isSkippable">false</flowable:ma>
        <flowable:ma name="isOverridable">false</flowable:ma>
        <flowable:ma name="isRollbackable">false</flowable:ma>
        <flowable:ma name="isSuspendable">false</flowable:ma>
        <flowable:ma name="isAutoStart">false</flowable:ma>
        <flowable:ma name="isAutoContinue">false</flowable:ma>
        <flowable:ma name="isUncompleteTrigger">false</flowable:ma>
        <flowable:ma name="needlessExecution">1==1</flowable:ma>
      </extensionElements>
      <incoming>Flow_1r6uf7u</incoming>
      <outgoing>Flow_1nm8834</outgoing>
    </receiveTask>
    <sequenceFlow id="Flow_1r6uf7u" sourceRef="StartEvent_1" targetRef="create_legal_database" />
    <sequenceFlow id="Flow_1nm8834" sourceRef="create_legal_database" targetRef="Gateway_0hm8mpu" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNEdge id="Flow_1nm8834_di" bpmnElement="Flow_1nm8834">
        <di:waypoint x="190" y="170" />
        <di:waypoint x="265" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1r6uf7u_di" bpmnElement="Flow_1r6uf7u">
        <di:waypoint x="18" y="170" />
        <di:waypoint x="90" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0buf5yv_di" bpmnElement="Flow_0buf5yv">
        <di:waypoint x="550" y="195" />
        <di:waypoint x="550" y="300" />
        <di:waypoint x="620" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1jza7o6_di" bpmnElement="Flow_1jza7o6">
        <di:waypoint x="550" y="145" />
        <di:waypoint x="550" y="40" />
        <di:waypoint x="620" y="40" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_15ot7q6_di" bpmnElement="Flow_15ot7q6">
        <di:waypoint x="440" y="240" />
        <di:waypoint x="480" y="240" />
        <di:waypoint x="480" y="170" />
        <di:waypoint x="525" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1s3vgb2_di" bpmnElement="Flow_1s3vgb2">
        <di:waypoint x="440" y="100" />
        <di:waypoint x="480" y="100" />
        <di:waypoint x="480" y="170" />
        <di:waypoint x="525" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1pnzngw_di" bpmnElement="Flow_1pnzngw">
        <di:waypoint x="805" y="170" />
        <di:waypoint x="862" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0t8jy8t_di" bpmnElement="Flow_0t8jy8t">
        <di:waypoint x="720" y="300" />
        <di:waypoint x="780" y="300" />
        <di:waypoint x="780" y="195" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1ikx91i_di" bpmnElement="Flow_1ikx91i">
        <di:waypoint x="720" y="170" />
        <di:waypoint x="755" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0ms1711_di" bpmnElement="Flow_0ms1711">
        <di:waypoint x="720" y="40" />
        <di:waypoint x="780" y="40" />
        <di:waypoint x="780" y="145" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1sisxgh_di" bpmnElement="Flow_1sisxgh">
        <di:waypoint x="575" y="170" />
        <di:waypoint x="620" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1ar8ja6_di" bpmnElement="Flow_1ar8ja6">
        <di:waypoint x="290" y="195" />
        <di:waypoint x="290" y="240" />
        <di:waypoint x="340" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0p14dt7_di" bpmnElement="Flow_0p14dt7">
        <di:waypoint x="290" y="145" />
        <di:waypoint x="290" y="100" />
        <di:waypoint x="340" y="100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="-18" y="152" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="-11" y="188" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_0hm8mpu_di" bpmnElement="Gateway_0hm8mpu">
        <dc:Bounds x="265" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1lke9ha_di" bpmnElement="dl_reviewing">
        <dc:Bounds x="620" y="0" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_048k9zk_di" bpmnElement="Gateway_048k9zk">
        <dc:Bounds x="525" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1yg6luq_di" bpmnElement="legal_reviewing">
        <dc:Bounds x="620" y="260" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0nnoebp_di" bpmnElement="finance_reviewing">
        <dc:Bounds x="620" y="130" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1537ypr_di" bpmnElement="Gateway_1537ypr">
        <dc:Bounds x="755" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1tusbpq_di" bpmnElement="Event_1tusbpq">
        <dc:Bounds x="862" y="152" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="869" y="191" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0gniqhx_di" bpmnElement="legal_submit">
        <dc:Bounds x="340" y="60" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1lslajn_di" bpmnElement="dl_submit">
        <dc:Bounds x="340" y="200" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0ic4wwm_di" bpmnElement="create_legal_database">
        <dc:Bounds x="90" y="130" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>
`;

export const content1 = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" targetNamespace="" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd">
  <collaboration id="sid-c0e745ff-361e-4afb-8c8d-2a1fc32b1424">
    <participant id="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F" name="Customer" processRef="sid-C3803939-0872-457F-8336-EAE484DC4A04" />
  </collaboration>
  <process id="sid-C3803939-0872-457F-8336-EAE484DC4A04" name="Customer" processType="None" isClosed="false" isExecutable="false">
    <extensionElements />
    <laneSet id="sid-b167d0d7-e761-4636-9200-76b7f0e8e83a">
      <lane id="sid-57E4FE0D-18E4-478D-BC5D-B15164E93254">
        <flowNodeRef>sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26</flowNodeRef>
        <flowNodeRef>sid-E49425CF-8287-4798-B622-D2A7D78EF00B</flowNodeRef>
        <flowNodeRef>sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138</flowNodeRef>
        <flowNodeRef>sid-E433566C-2289-4BEB-A19C-1697048900D2</flowNodeRef>
        <flowNodeRef>sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9</flowNodeRef>
        <flowNodeRef>SCAN_OK</flowNodeRef>
      </lane>
    </laneSet>
    <task id="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26" name="Scan QR code">
      <incoming>sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D</incoming>
      <outgoing>sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A</outgoing>
    </task>
    <task id="sid-E49425CF-8287-4798-B622-D2A7D78EF00B" name="Open product information in mobile  app">
      <incoming>sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB</incoming>
      <outgoing>sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C</outgoing>
    </task>
    <startEvent id="sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138" name="Notices&#10;QR code">
      <outgoing>sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD</outgoing>
    </startEvent>
    <endEvent id="sid-E433566C-2289-4BEB-A19C-1697048900D2" name="Is informed">
      <incoming>sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C</incoming>
    </endEvent>
    <exclusiveGateway id="sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9">
      <incoming>sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD</incoming>
      <incoming>sid-337A23B9-A923-4CCE-B613-3E247B773CCE</incoming>
      <outgoing>sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D</outgoing>
    </exclusiveGateway>
    <exclusiveGateway id="SCAN_OK" name="Scan successful?&#10;">
      <incoming>sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A</incoming>
      <outgoing>sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB</outgoing>
      <outgoing>sid-337A23B9-A923-4CCE-B613-3E247B773CCE</outgoing>
    </exclusiveGateway>
    <sequenceFlow id="sid-337A23B9-A923-4CCE-B613-3E247B773CCE" name="Yes" sourceRef="SCAN_OK" targetRef="sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9" />
    <sequenceFlow id="sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D" sourceRef="sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9" targetRef="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26" />
    <sequenceFlow id="sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB" name="No" sourceRef="SCAN_OK" targetRef="sid-E49425CF-8287-4798-B622-D2A7D78EF00B" />
    <sequenceFlow id="sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C" sourceRef="sid-E49425CF-8287-4798-B622-D2A7D78EF00B" targetRef="sid-E433566C-2289-4BEB-A19C-1697048900D2" />
    <sequenceFlow id="sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A" sourceRef="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26" targetRef="SCAN_OK" />
    <sequenceFlow id="sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD" sourceRef="sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138" targetRef="sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9" />
  </process>
  <bpmndi:BPMNDiagram id="sid-74620812-92c4-44e5-949c-aa47393d3830">
    <bpmndi:BPMNPlane id="sid-cdcae759-2af7-4a6d-bd02-53f3352a731d" bpmnElement="sid-c0e745ff-361e-4afb-8c8d-2a1fc32b1424">
      <bpmndi:BPMNShape id="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F_gui" bpmnElement="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F" isHorizontal="true">
        <omgdc:Bounds x="83" y="105" width="933" height="250" />
        <bpmndi:BPMNLabel labelStyle="sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b">
          <omgdc:Bounds x="47.49999999999999" y="170.42857360839844" width="12.000000000000014" height="59.142852783203125" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sid-57E4FE0D-18E4-478D-BC5D-B15164E93254_gui" bpmnElement="sid-57E4FE0D-18E4-478D-BC5D-B15164E93254" isHorizontal="true">
        <omgdc:Bounds x="113" y="105" width="903" height="250" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26_gui" bpmnElement="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26">
        <omgdc:Bounds x="393" y="170" width="100" height="80" />
        <bpmndi:BPMNLabel labelStyle="sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b">
          <omgdc:Bounds x="360.5" y="172" width="84" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sid-E49425CF-8287-4798-B622-D2A7D78EF00B_gui" bpmnElement="sid-E49425CF-8287-4798-B622-D2A7D78EF00B">
        <omgdc:Bounds x="728" y="170" width="100" height="80" />
        <bpmndi:BPMNLabel labelStyle="sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b">
          <omgdc:Bounds x="695.9285736083984" y="162" width="83.14285278320312" height="36" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A_gui" bpmnElement="sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A">
        <omgdi:waypoint x="493" y="210" />
        <omgdi:waypoint x="585" y="210" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="494" y="185" width="90" height="20" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB_gui" bpmnElement="sid-8B820AF5-DC5C-4618-B854-E08B71FB55CB">
        <omgdi:waypoint x="635" y="210" />
        <omgdi:waypoint x="728" y="210" />
        <bpmndi:BPMNLabel labelStyle="sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581">
          <omgdc:Bounds x="642" y="185" width="16" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD_gui" bpmnElement="sid-7B791A11-2F2E-4D80-AFB3-91A02CF2B4FD">
        <omgdi:waypoint x="223" y="210" />
        <omgdi:waypoint x="275" y="210" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="204" y="185" width="90" height="20" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D_gui" bpmnElement="sid-4DC479E5-5C20-4948-BCFC-9EC5E2F66D8D">
        <omgdi:waypoint x="325" y="210" />
        <omgdi:waypoint x="393" y="210" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="314" y="185" width="90" height="20" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C_gui" bpmnElement="sid-57EB1F24-BD94-479A-BF1F-57F1EAA19C6C">
        <omgdi:waypoint x="828" y="210" />
        <omgdi:waypoint x="901" y="210" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="820" y="185" width="90" height="20" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="sid-337A23B9-A923-4CCE-B613-3E247B773CCE_gui" bpmnElement="sid-337A23B9-A923-4CCE-B613-3E247B773CCE">
        <omgdi:waypoint x="611" y="234" />
        <omgdi:waypoint x="610.5" y="299" />
        <omgdi:waypoint x="300.5" y="299" />
        <omgdi:waypoint x="301" y="234" />
        <bpmndi:BPMNLabel labelStyle="sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581">
          <omgdc:Bounds x="585" y="236" width="21" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="StartEvent_0l6sgn0_di" bpmnElement="sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138">
        <omgdc:Bounds x="187" y="192" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="182" y="229" width="46" height="24" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_0xwuvv5_di" bpmnElement="sid-E433566C-2289-4BEB-A19C-1697048900D2">
        <omgdc:Bounds x="901" y="192" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="892" y="231" width="56" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ExclusiveGateway_1g0eih2_di" bpmnElement="sid-5134932A-1863-4FFA-BB3C-A4B4078B11A9" isMarkerVisible="true">
        <omgdc:Bounds x="275" y="185" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="210" y="160" width="90" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ExclusiveGateway_0vci1x5_di" bpmnElement="SCAN_OK" isMarkerVisible="true">
        <omgdc:Bounds x="585" y="185" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="568" y="157" width="88" height="24" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
    <bpmndi:BPMNLabelStyle id="sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581">
      <omgdc:Font name="Arial" size="11" isBold="false" isItalic="false" isUnderline="false" isStrikeThrough="false" />
    </bpmndi:BPMNLabelStyle>
    <bpmndi:BPMNLabelStyle id="sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b">
      <omgdc:Font name="Arial" size="12" isBold="false" isItalic="false" isUnderline="false" isStrikeThrough="false" />
    </bpmndi:BPMNLabelStyle>
  </bpmndi:BPMNDiagram>
</definitions>`;
