import PizZip from 'pizzip';
import PizzipUtils from 'pizzip/utils';
import Docxtemplater from 'docxtemplater';
import FileSave from 'file-saver';
import ImageModule from 'docxtemplater-image-module-free';
import * as echarts from 'echarts';
import { imgUrlToBase64 } from '@/utils/image';
import { base64ToArrayBuffer } from '@/utils/file';

// 导出的参数
export interface ExportParams {
  imgList: string[]
}

export async function exportWord(params: ExportParams) {
  // 转换模板
  PizzipUtils.getBinaryContent('/src/components/export-word/word-template.docx', async function (err, res) {
    if (err) {
      throw err;
    };
    // 将文件转为zip文件
    let pizZip = new PizZip(res);
    let doc = new Docxtemplater();
    doc.loadZip(pizZip);

    // 设置options
    doc.setOptions({
      nullGetter: function () {
        return '';
      }
    });

    // 加载图片模块及配置
    doc.attachModule(new ImageModule({
      centered: false,
      fileType: 'docx',
      getImage: function (value) {
        if (value.size && value.data) {
          return base64ToArrayBuffer(value.data);
        }
        return base64ToArrayBuffer(value);
      },
      getSize: function (imgBuffer: ArrayBuffer, value) {
        if (value.size && value.data) {
          return value.size;
        }
        return [200, 200];
      }
    }));

    // img图片
    let imgBase64List = [];
    try {
      const base64List = await Promise.all(params?.imgList?.map((url) => imgUrlToBase64(url)));
      imgBase64List = base64List?.map((base64) => ({ url: base64 }));
    } catch (error) {
      console.log(error, 'img导出错误')
    }

    //  echarts图表
    const div = document.createElement('div');
    div.setAttribute('style', 'width: 400px;height:200px;');
    const option = {
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: 'line'
        }
      ]
    };
    const myChart = echarts.init(div);
    myChart.setOption(option);
    // 设置
    doc.setData({
      image: myChart.getDataURL({
        pixelRatio: 5, // 导出的图片分辨率比率,默认是1
        backgroundColor: '#afdfe4', // 图表背景色
        excludeComponents: ['toolbox'], // 忽略组件的列表
        type: 'png' // 图片类型支持png和jpeg
      }),
      imgs: imgBase64List
    });

    // 进行内容填充
    try {
      doc.render();
    } catch (error) {
      throw error;
    }
    // 获取要下载的文件
    let out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    // 进行下载
    FileSave(out, '带有图片的docx下载');
  });
};
