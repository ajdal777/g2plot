# 响应式图表

## 概述

响应式图表( responsive plot) 的目的是为了保证图表在任何数据和显示尺寸下的基本可读性问题。

在现实的图表应用场景中，一个棘手的难题是图表的展示空间往往并不足够显示图表的数据量。我们的业务数据可能呈现多种形态，不一定是理想数据；同时图表的使用场景也经常是在一个上下文语境中，比如在文本中插入的图表、中台系统、dashboard等，这决定了图表未必能获得理想的展示空间。

图表数据量和展示空间的矛盾会造成图表布局错乱、组件遮挡图形、组件各部分相互重叠等问题。下图是两个典型案例：

<p><img src="https://gw.alipayobjects.com/mdn/rms_d314dd/afts/img/A*y-k1Q4V7jXsAAAAAAAAAAABkARQnAQ" width="600"></p>

这种非常典型的信息密度(information density)过载现象正是G2Plot响应式模块所要解决的问题 — 当信息密度过高时，对图表辅助信息进行抽稀，保证图表主要信息的展示，以使图表的信息密度达到合理平衡。

这种非常典型的信息密度(information density)过载现象正是G2Plot响应式模块所要解决的问题 — 当信息密度过高时，对图表辅助信息进行抽稀，保证图表主要信息的展示，以使图表的信息密度达到合理平衡。

g2plot响应式方案由三块组成： constraints（约束条件）、 rules（响应规则) 和 responsiveTheme（响应式主题）。基本思路是：首先定义图表合理信息密度的衡量标准(constraints)，然后去判断图表各组成部分是否满足该标准，如果不满足标准，则对图表应用响应规则(rules）。这个过程是iterative的，如果不满足约束条件，响应规则会被依次执行下去。

一个约束条件(constraint)对应一组响应规则(rules)，多个约束组构成一个完整的响应式方案 — resonsiveTheme。

<p><img src="https://gw.alipayobjects.com/mdn/rms_d314dd/afts/img/A*L6qZRrqCOLwAAAAAAAAAAABkARQnAQ" width="600"></p>

## Constraint （约束条件）

可以将constraint（约束条件) 理解为一个判断方法，定义某图表组成部分的信息密度衡量标准，并判断该部分是否符合该标准。

下面的例子中声明了一个axis（坐标轴）的约束条件，该条件判断坐标轴label之间的间距是否大于4像素。

```
axis: {
  constraint:{
    name: 'elementDist',
    option:{
      value: 4
    }
  }
}
```

### 约束库

g2plot内置了一套常用的constraint library，目前响应式模块还在试验和打磨阶段，该库将会持续更新：

| constraint name | option | type | usage | intro |
| --- | --- | --- | --- | --- |
| elementDist | value: Number | chain | compare | 两元素之间的距离 |
| elementDistVertical | value: Number | chain | compare | 两元素之间的纵向距离 |
| elementDistHorizontal | value: Number | chain | compare | 两元素之间的横向距离 |
| elementWidth | ratio: Number | padding | compare | 元素的宽度占母级元素的比例 |
| elementCollision |  | group | compare | 两元素是否发生碰撞 |
| columnWidth | ratio: Number | padding | assign | 柱形宽度 |
| ringThickness | ratio: Number | padding | assign | 环形宽度 |
| minRingThickness | value: Number | padding | assign | 最小环形宽度 |

> 注1：type的含义
> - chain类型的constraint定义的是一列有序node，前后两node之间的约束关系
> - padding类型的constraint定义的是有子母级关系的两个nodes之间的约束关系
> - group类型的constraint定义的一列nodes，node与node之间的两两约束关系，label与label之间的碰撞检测就属于group类型
> 
> 注2：usage的含义
> - compare：判断方法，出参为boolean
> - assign：赋值方法

### 注册自定义约束条件
g2plot允许用户注册自己的约束条件，允许覆盖现有约束库中的条件。

```
function myConstraint(parameters,cfg?){
}

plot.registerConstraint(name,{
  type:'padding',
  usage: 'compare',
  method: myConstraint
});
```

## Rules （响应规则）

响应规则是当constraint（约束条件）不满足的时候，对图表组件的优化策略。一个constraint可能对应着多个优化策略，这些优化策略将按配置的顺序执行。

### 规则库

g2plot内置了一套常用的rule library，目前响应式模块还在试验和打磨阶段，该库将会持续更新：

| rule name | option | intro |
| --- | --- | --- |
| textWrapper | lineNumber: Number | 文本折行，可设置每行字数或折几行 |
| textRotation | degree: Number | 文本旋转，可设置旋转角度 |
| textAbbrevaite | abbreviateBy: string | 文本省略，可设置省略头部、尾部或中间 |
| textHide |  | 文本消失 |
| digitAbbraviate | unit: 'k' | 'm' | 'b' | 't' | 'auto'<br />decimal: number<br />formatter: Function | 数字省略，可设置格式化单位、保留小数点数，或自定义一个formatter<br />如不设置格式化单位，则会自动应用k - m - b- t 规则 |
| dateTimeStringAbbraviate | keep: any[] | 时间文本周期显示，可设置保头保尾或保留任意一index |
| textAbbraviate | abbreviateBy?: 'start' | 'middle' | 'end' | 文本省略，可设置省略头部、省略中间、省略尾部 |
| robustAbbraviate | unit: 'k' | 'm' | 'b' | 't' | 'auto'<br />decimal: number<br />formatter: Function<br />keep: any[] | 判断字符类型，应用text / digit / dateTime abbreviate方法 |
| nodesSampling | keep: array | 抽样显示，可设置保头保尾或任意一个index |
| nodesSamplingByAbbraviate |  | 配合dateTimeAbbraviate方法使用，抽样掉经过省略的文本，保留完整的文本。 |
| nodeSamplingByChange |  | 根据数据间的变化进行抽样，保留变化较大的点 |
| nodeSamplingByState | state: {<br />    name: string,<br />    exp: string | function<br />} | 根据状态量进行抽样，保留符合状态量的node |
| nodeJitter |  | 元素在水平和垂直方向抖开 |
| nodeJitterUpward |  | 元素向上抖开并拉线 |
| clearOverlapping |  | 在一组元素中去除overlap的元素，当多个元素发生重叠时，只保留位于最高点的元素。此方法用于多折线数据点label的overlapping。 |

### 注册自定义响应规则
g2plot允许用户注册自己的响应规则，允许覆盖现有规则库中的规则。

```
function myRule(){}
plot.registerResponsiveRule(name, myRule);
```
<br/>

## ResponsiveTheme
多个constraints和rules的组合构成响应式图表的完整解决方案 —  responsiveTheme（响应式主题）。G2Plot内部提供一套默认好用的响应式主题，同时也向用户开放注册自己的响应式主题。

### responsiveTheme的结构
一个完整的responsiveTheme的结构按图表构成进行组织，定义了图表内各组件的约束条件和该条件的响应规则。

以柱状图为例，柱状图参与响应式的图表元素为图形(column)、坐标轴(axis)、图形标签(label)，它的responsiveTheme结构如下：

```
const responsiveTheme = {
  axis:{
    
    x:{
      category:{
        constraints: [],
        rules: []
      }
    },
    
    y: {
      linear:{
        constraints: [],
        rules: []
      }
    }
  },
  
  label:{
    constraints:[],
    rules:[]
  },
  
  column:{
    constraints: []
  }
  
};
```

### 注册responsiveTheme
用户在注册自己的responsiveTheme时，可以自由的调用和组装contraints库和rules库中的方法。

调用一个constraint方法：

```
// 调用elementDist约束条件，并声明元素最小间距为8
{
  name: 'elementDist',
  option: {
    value: 8
  }
}
```

调用一个rule方法：

```
// 调用textAbbravaite响应规则，并声明省略文字的尾部
{
  name: 'textAbbrevaite',
  option:{
    abbraviateBy: 'end'
  }
}
```

组装：

```
const lineTheme = {
  label: {
    constraints: [{ 
      name: 'elementDist',
      option:{
        value: 8
      }
    }],
    rules: {
      elementCollision: [{ name: 'nodesResamplingByChange' }, { name: 'clearOverlapping' }],
    },
  },
});
registerResponsiveTheme('line', lineTheme);
```
