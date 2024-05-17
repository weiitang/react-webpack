import {
  Button,
  DialogInstance,
  DialogPlugin,
  Space,
  Radio,
  Upload,
} from 'tdesign-react';
import LuckyExcel from '@src/lib/luckysheet-excel/luckyexcel.esm';
import { toast } from '@src/components/td-plugin/tdesign-plugin';
import { useState } from 'react';

let dialogInstance: DialogInstance;

function Content(props) {
  const { callback } = props;
  const [cover, setCover] = useState(false);
  const [loading, setLoading] = useState(false);

  const importExcel = (files) => {
    setLoading(true);
    LuckyExcel.transformExcelToLucky(files[0], (exportJson) => {
      if (exportJson.sheets === null || exportJson.sheets.length === 0) {
        toast('读取excel文件内容失败', 'error');
        return;
      }
      setLoading(false);
      callback(exportJson.sheets, cover);
      setTimeout(() => {
        dialogInstance.destroy();
      }, 0);
    });
  };

  return (
    <div>
      <Space direction="vertical" style={{ paddingBottom: 20 }}>
        <p>'是否覆盖工作表'</p>
        <Radio.Group
          value={cover}
          onChange={(value: boolean) => {
            setCover(value);
          }}
        >
          <Radio value={false}>'否：将新建工作表'</Radio>
          <Radio value={true}>是：将覆盖工作表</Radio>
        </Radio.Group>
      </Space>
      <div style={{ textAlign: 'right', paddingBottom: 20, paddingTop: 16 }}>
        <Space>
          <Button
            type="reset"
            theme="default"
            onClick={() => dialogInstance.destroy()}
          >
            '取消'
          </Button>
          <Upload
            style={{ lineHeight: 'unset', color: 'white' }}
            theme="custom"
            autoUpload={false}
            onSelectChange={importExcel}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          >
            <Button loading={loading} disabled={loading} theme="primary">
              '导入'
            </Button>
          </Upload>
        </Space>
      </div>
    </div>
  );
}

export const importExcelDialog = (
  props,
  callback?: (data, isCover: boolean) => void
) => {
  dialogInstance = DialogPlugin.confirm({
    width: '600px',
    header: '导入Excel',
    body: <Content {...props} callback={callback}></Content>,
    closeOnOverlayClick: false,
    footer: null,
    onClose: () => dialogInstance.destroy(),
    onCancel: () => dialogInstance.destroy(),
    onConfirm: () => dialogInstance.destroy(),
  });
};
