/**
 * BPMN React封装
 */
import { useEffect, useRef } from 'react';
// import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.development.js';
import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.production.min.js';
import BpmnViewer from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
// import BpmnModeler from 'bpmn-js/lib/Modeler';
// import BpmnViewer from 'bpmn-js/dist/bpmn-viewer.production.min.js'; // navigated可以拖拽查看，非navigated不可以
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

import { MessagePlugin } from 'tdesign-react';
import classNames from 'classnames';

import { xmlToSave, xmlToDisplay } from './custom/utils';
import customModule from './custom';
import flowableExtension from './custom/flowable.json';

export interface ReactBpmnProps {
  className?: string;
  xml: string | ArrayBuffer; // xml内容；
  readonly?: boolean;
  onInit?: (bpmnInstance: typeof BpmnModeler | typeof BpmnViewer) => void;
  onXmlInit?: (xml: string) => void; // xml首次初始化成功
}

export const ReactBpmn = (props) => {
  const { className, xml, readonly, onInit, onXmlInit } = props;
  const containerRef = useRef(null);
  const bpmnInstanceRef = useRef<any>(null);
  const xmlInitRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    // const options = {
    //   width: '100%',
    //   height: '100%',
    //   position: 'relative',
    //   container: '',
    //   canvas: '',
    //   modules: {},
    //   additionalModules: {},
    //   moddleExtensions: {
    //     bpmn: BpmnPackage,
    //     bpmndi: BpmnDiPackage,
    //     dc: DcPackage,
    //     di: DiPackage,
    //     bioc: BiocPackage,
    //     color: BpmnInColorPackage,
    //   },
    // };
    bpmnInstanceRef.current = readonly
      ? new BpmnViewer({ container })
      : new BpmnModeler({
          container,
          keyboard: { bindTo: document }, // 不添加这个键盘无效
          additionalModules: [customModule],
          moddleExtensions: {
            flowable: flowableExtension,
          },
        });

    bpmnInstanceRef.current.on('import.done', (event: any) => {
      const { error, warnings } = event;

      if (error) {
        MessagePlugin.error(error.message);
        return;
      }

      bpmnInstanceRef.current.get('canvas').zoom('fit-viewport');

      if (warnings && warnings.length > 0) {
        MessagePlugin.info(warnings.map((m: any) => m.message).join(';'));
      }
    });

    // 调用saveXML返回结果前，对数据进行处理
    bpmnInstanceRef.current.on('saveXML.serialized', (result: any) =>
      xmlToSave(result.xml)
    );

    if (onInit) {
      onInit(bpmnInstanceRef.current);
    }
  }, [containerRef]);

  useEffect(() => {
    if (!xml) {
      return;
    }

    if (xml === 'new') {
      createDiagram();
    } else {
      displayDiagram(xml);
    }
  }, [xml]);

  const triggerXmlInit = async () => {
    if (!xmlInitRef.current) {
      const { xml } = await bpmnInstanceRef.current.saveXML({ format: false });
      onXmlInit?.(xml);
      xmlInitRef.current = true;
    }
  };

  const createDiagram = async () => {
    await bpmnInstanceRef.current?.createDiagram();
    triggerXmlInit();
  };

  // const fetchDiagram = async (url: string) => {
  //   try {
  //     const response = await httpGet(url);
  //     displayDiagram(response);
  //   } catch (e) {
  //     MessagePlugin.error(e.message);
  //   }
  // };

  const displayDiagram = async (diagramXML: string) => {
    await bpmnInstanceRef.current.importXML(
      xmlToDisplay(diagramXML),
      (err: boolean) => {
        if (!err) {
          triggerXmlInit();

          // const elementRegistry = bpmnInstanceRef.current.get('elementRegistry');
          // elementRegistry.forEach((elem, gfx) => {
          //   console.log(elem, gfx);
          // });
        }
      }
    );
  };

  return <div className={classNames(className)} ref={containerRef}></div>;
};
