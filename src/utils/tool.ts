//绘制箭头方法
function drawArrow(fromX:number, fromY:number, toX:number, toY:number, theta:number, headlen:number) {
    theta = typeof theta != "undefined" ? theta : 30;
    headlen = typeof theta != "undefined" ? headlen : 10;
    // 计算各角度和对应的P2,P3坐标
    let angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
      angle1 = (angle + theta) * Math.PI / 180,
      angle2 = (angle - theta) * Math.PI / 180,
      topX = headlen * Math.cos(angle1),
      topY = headlen * Math.sin(angle1),
      botX = headlen * Math.cos(angle2),
      botY = headlen * Math.sin(angle2);
    let arrowX = fromX - topX,
      arrowY = fromY - topY;
    let path = " M " + fromX + " " + fromY;
    path += " L " + toX + " " + toY;
    arrowX = toX + topX;
    arrowY = toY + topY;
    path += " M " + arrowX + " " + arrowY;
    path += " L " + toX + " " + toY;
    arrowX = toX + botX;
    arrowY = toY + botY;
    path += " L " + arrowX + " " + arrowY;
    return path;
  }

  //坐标转换
  function transformMouse(mouseX:number, mouseY:number) {
    return { x: mouseX, y: mouseY };
  }

  function download(url:string, filename:string, cb?:Function) {
    // 具体实现方案参考微信公众号《趣谈前端》- iframe跨页通信和前端实现文件下载
    return fetch(url).then(res => res.blob().then(blob => {
        let a = document.createElement('a');
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        cb && cb()
    }))
  }

  export {
    drawArrow,
    transformMouse,
    download
  }