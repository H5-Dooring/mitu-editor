import { fabric } from "fabric";
import { Button, Tooltip, Modal, InputNumber, Upload, Input } from 'antd';
import { nanoid } from 'nanoid';
import { history } from 'umi';
import { 
  ArrowLeftOutlined, 
  FontSizeOutlined,
  PictureOutlined,
  LineOutlined,
  BorderOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { useEffect, useState, useRef, ChangeEventHandler } from 'react';
import { drawArrow, download } from '@/utils/tool';
import msk from '@/assets/msk.png';
import logo from '@/assets/logo.png';
import styles from './index.less';

type ElementType = 'IText' | 'Triangle' | 'Circle' | 'Rect' | 'Line' | 'Image' | 'Arrow' | 'Mask'

const baseShapeConfig = {
  IText: {
    text: 'H5-Dooring',
    width : 60,
    height : 60,
    fill : '#06c'
  },
  Triangle: {
    width: 100,
    height: 100,
    fill: '#06c'
  },
  Circle: {
    radius: 50,
    fill: '#06c'
  },
  Rect: {
    width : 60,
    height : 60,
    fill : '#06c'
  },
  Line: {
    width: 100,
    height: 1,
    fill: '#06c'
  },
  Arrow: {},
  Image: {},
  Mask: {}
}

export default function IndexPage() {

  const [imgUrl, setImgUrl] = useState('');
  const [size, setSize] = useState([600, 400]);
  const [isShow, setIsShow] = useState(false);
  const [tpls, setTpls] = useState<any>(() => {
    const tpls = JSON.parse(localStorage.getItem('tpls') || "{}")

    return Object.keys(tpls).map(item => ({t: tpls[item].t, id: item}))
  });
  const [isTplShow, setIsTplShow] = useState(false);
  const [attrs, setAttrs] = useState({
    fill: '#0066cc',
    stroke: '',
    strokeWidth: 0,
  })
  const canvasRef = useRef<any>(null);
  const tplNameRef = useRef<any>(null);

  // 插入元素
  const insertElement = (type:ElementType, url?:string) => {
    let shape = null;
    if(type === 'IText') {
      shape = new fabric[type](nanoid(8), {
        ...baseShapeConfig[type], 
        left: size[0] / 3,
        top: size[1] / 3
      })
    } else if(type === 'Line') {
      shape = new fabric.Path('M 0 0 L 100 0', {
        stroke: '#ccc', 
        strokeWidth: 2,
        objectCaching: false,
        left: size[0] / 3,
        top: size[1] / 3
      })
    } else if(type === 'Arrow') {
      shape = new fabric.Path(drawArrow(0, 0, 100, 100, 30, 30), {
        stroke: '#ccc',
        fill: 'rgba(255,255,255,0)', 
        strokeWidth: 2,
        angle: -90,
        objectCaching: false,
        left: size[0] / 3,
        top: size[1] / 3
      })
    } else if(type === 'Image'){
      fabric.Image.fromURL(url || logo, function(oImg:any) {
        oImg.scale(0.5);//图片缩小10倍
        canvasRef.current.add(oImg);
      });
      return
    } else if(type === 'Mask') {
      fabric.Image.fromURL(msk, function(oImg:any) {
        oImg.scale(0.5);//图片缩小10倍
        canvasRef.current.add(oImg);
      }, {crossOrigin: 'anonymous'});
      return
    } else {
      shape = new fabric[type]({
        ...baseShapeConfig[type], 
        left: size[0] / 3,
        top: size[1] / 3
      })
    }
    canvasRef.current.add(shape);
  }

  // 预览
  const handlePreview = () => {
    canvasRef.current.discardActiveObject()
    canvasRef.current.renderAll();
    setImgUrl(getImgUrl)
    setIsShow(true)
  }

  // 清空画布
  const clear = () => {
    canvasRef.current.clear();
    canvasRef.current.backgroundColor = 'rgba(255,255,255,1)';
  }

  // 关闭预览
  const closeModal = () => {
    setIsShow(false)
  }

  // 更新画布
  const updateSize = (type: 0 | 1, v:number) => {
    if(type) {
      
    }else {
      canvasRef.current.setWidth(v)
      setSize([v, size[1]])
    }
  }

  const goBack = () => {
    history.goBack();
  }

  const handleJumpH5 = () => {
    window.open('http://h5.dooring.cn/h5_plus');
  }

  const getImgUrl = () => {
    const img = document.getElementById("canvas");
    const src = (img as HTMLCanvasElement).toDataURL("image/png");
    return src
  }

  const saveImg = () => {
    canvasRef.current.discardActiveObject()
    canvasRef.current.renderAll();

    download(getImgUrl(), nanoid(8) + '.png')
  }

  const props = {
    action: '',
    beforeUpload(file:File) {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          insertElement('Image', reader.result || logo)
        };
      });
    },
  };

  const updateAttr = (type: 'fill' | 'stroke' | 'strokeWidth' | 'imgUrl', val:string | number) => {
    setAttrs({...attrs, [type]: val})
    const obj = canvasRef.current.getActiveObject()
    obj.set({...attrs})
    canvasRef.current.renderAll();
  }

  const closeTplModal = () => {
    setIsTplShow(false);
  }

  const handleSaveTpl = () => {
    const val = tplNameRef.current.state.value
    const json = canvasRef.current.toDatalessJSON()
    const id = nanoid(8)
    // 存json
    const tpls = JSON.parse(localStorage.getItem('tpls') || "{}")
    tpls[id] = {json, t: val};
    localStorage.setItem('tpls', JSON.stringify(tpls))
    // 存图片
    canvasRef.current.discardActiveObject()
    canvasRef.current.renderAll()
    const imgUrl = getImgUrl()
    const tplImgs = JSON.parse(localStorage.getItem('tplImgs') || "{}")
    tplImgs[id] = imgUrl
    localStorage.setItem('tplImgs', JSON.stringify(tplImgs))

    setTpls((prev:any) => [...prev, {id, t: val}])
    setIsTplShow(false)
  }

  const renderJson = (id:string) => {
    const tpls = JSON.parse(localStorage.getItem('tpls') || "{}")
    canvasRef.current.clear();
    canvasRef.current.backgroundColor = 'rgba(255,255,255,1)';
    canvasRef.current.loadFromJSON(tpls[id].json, canvasRef.current.renderAll.bind(canvasRef.current))
  }

  const showTplModal = () => {
    setIsTplShow(true);
  }

  useEffect(() => {
    canvasRef.current = new fabric.Canvas('canvas');
    // 自定义删除按钮
    const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    const img = document.createElement('img');
    img.src = deleteIcon;

    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -32,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderIcon,
      cornerSize: 24
    });

    const shape = new fabric.IText(nanoid(8), {
      text: 'H5-Dooring',
      width : 60,
      height : 60,
      fill : '#06c',
      left: 30,
      top: 30
    })

    canvasRef.current.add(shape);
    canvasRef.current.backgroundColor = 'rgba(255,255,255,1)';

    canvasRef.current.on("mouse:down", function (options:any) {
      console.log(options, options.e.offsetX, options.e.offsetY)
      if(options.target) {
        const { 
          fill = '#0066cc',
          stroke,
          strokeWidth = 0
        } = options.target
        setAttrs({ fill, stroke: stroke || '', strokeWidth: strokeWidth })
        canvasRef.current.renderAll();
      }
    });

    canvasRef.current.on("mouse:up", function (options:any) {
      
    });
    canvasRef.current.on("mouse:move", function (options:any) {
      
    });

    function deleteObject(eventData:any, transform:any) {
      const target = transform.target;
      const canvas = target.canvas;
          canvas.remove(target);
          canvas.requestRenderAll();
    }
  
    function renderIcon(ctx:any, left:number, top:number, styleOverride:any, fabricObject:any) {
      const size = this.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(img, -size/2, -size/2, size, size);
      ctx.restore();
    }
  }, [])

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.goBack} onClick={goBack}><ArrowLeftOutlined /> 返回H5编辑器</div>
        <div className={styles.logo}>Dooring | 图片编辑器</div>
        <div className={styles.rightArea}><Button type="primary" onClick={handleJumpH5}>制作H5</Button></div>
      </header>
      <main className={styles.contentWrap}>
        <section className={styles.tplWrap}>
          <div className={styles.simpleTit}>模版素材</div>
          <div className={styles.tpls}>
            {
              tpls.map((item:{id:string,t:string},i:number) => {
                return <div key={i} className={styles.tplItem} onClick={() => renderJson(item.id)}>
                  <img src={JSON.parse(localStorage.getItem('tplImgs') || "{}")[item.id]} alt="" />
                  <div>{ item.t }</div>
                </div>
              })
            }
          </div>
        </section>
        <section className={styles.canvasWrap}>
          <div className={styles.controlWrap}>
            <div className={styles.leftArea}>
              {/* <Button className={styles.btn} size="small">撤销</Button>
              <Button className={styles.btn} size="small">重做</Button> */}
               <div>
                 <span style={{marginRight: '10px'}}>画布大小: </span>
                 <InputNumber size="small" min={1} defaultValue={size[0]} onChange={(v) => updateSize(0, v)} style={{width: 60, marginRight: 10}} />
                 <InputNumber size="small" min={1} defaultValue={size[1]} disabled style={{width: 60}} />
               </div>
            </div>
            <div className={styles.rightArea}>
              <Button className={styles.btn} size="small">背景</Button>
              <Button className={styles.btn} size="small" onClick={clear}>清空</Button>
              <Button className={styles.btn} size="small" onClick={handlePreview}>预览</Button>
            </div>
          </div>
            <canvas id="canvas" width={600} height={size[1]}></canvas>
        </section>
        <section className={styles.panelWrap}>
          <div className={styles.simpleTit}>属性编辑</div>
          <div className={styles.attrPanel}>
            <span className={styles.label}>填充: </span>
            <input type="color" style={{width: 60}} value={attrs.fill} onChange={(e:ChangeEventHandler<HTMLInputElement>) => updateAttr('fill', e.target.value)} />
            <span className={styles.label}>描边: </span><input type="color" value={attrs.stroke} style={{width: 60}} onChange={(e:ChangeEventHandler<HTMLInputElement>) => updateAttr('stroke', e.target.value)} />
            <span className={styles.label}>描边宽度: </span>
            <InputNumber size="small" min={0} value={attrs.strokeWidth} style={{width: 60}} onChange={(v) => updateAttr('strokeWidth', v)} />
          </div>
          <div className={styles.simpleTit}>插入元素</div>
          <div className={styles.shapeWrap}>
            <div className={styles.shape}>
              <Tooltip placement="bottom" title="点击使用">
                <div className={styles.text} onClick={() => insertElement('IText')}><FontSizeOutlined /></div>
              </Tooltip>
            </div>
            <div className={styles.shape}>
              <Tooltip placement="bottom" title="点击使用">
                <Upload {...props}>
                  <div className={styles.img}><PictureOutlined /></div>
                </Upload>
              </Tooltip>
            </div>
            <div className={styles.shape}>
              <Tooltip placement="bottom" title="点击使用">
                <div className={styles.line} onClick={() => insertElement('Line')}><LineOutlined /></div>
              </Tooltip>
            </div>
            <div className={styles.shape}>
              <Tooltip placement="bottom" title="点击使用">
                <div className={styles.rect} onClick={() => insertElement('Rect')}><BorderOutlined /></div>
              </Tooltip>
            </div>
            <div className={styles.shape}>
              <Tooltip placement="bottom" title="点击使用">
                <div className={styles.circle} onClick={() => insertElement('Circle')}></div>
              </Tooltip>
            </div>
            <div className={styles.shape}>
              <Tooltip placement="bottom" title="点击使用">
                <div className={styles.tringle} onClick={() => insertElement('Triangle')}></div>
              </Tooltip>
            </div>
            <div className={styles.shape}>
              <Tooltip placement="bottom" title="点击使用">
                <div className={styles.arrow} onClick={() => insertElement('Arrow')}><ArrowUpOutlined /></div>
              </Tooltip>
            </div>
            <div className={styles.shape}>
              <Tooltip placement="bottom" title="点击使用">
                <div className={styles.mask} onClick={() => insertElement('Mask')}><img src={msk} alt="" /></div>
              </Tooltip>
            </div>
          </div>
          <div className={styles.simpleTit}>保存</div>
          <div className={styles.operationArea}>
            <Button type="primary" block className={styles.control} onClick={saveImg}>保存图片</Button>
            <Button block className={styles.control} onClick={showTplModal}>保存为模版</Button>
          </div>
        </section>
      </main>
      <footer>点赞支持<a href="http://cdn.dooring.cn/dr/WechatIMG2.jpeg" target="_blank"></a></footer>
      <Modal title="预览图片" visible={isShow} footer={null} onCancel={closeModal} width={size[0]}>
        <img src={imgUrl} alt="" style={{width: '100%'}} />
      </Modal>
      <Modal 
        title="保存模版" 
        visible={isTplShow} 
        onCancel={closeTplModal} 
        onOk={handleSaveTpl} 
        width={500}
        okText="确定"
        cancelText="取消"
      >
        <div>
          <label htmlFor="">模版名称: </label>
          <Input placeholder="请输入模版名称" ref={tplNameRef} />
        </div>
      </Modal>
    </div>
  );
}
