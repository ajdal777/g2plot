import { CoordinateType } from '@antv/g2/lib/plot/interface';
import * as _ from '@antv/util';
import ViewLayer from '../../base/ViewLayer';
import { getComponent } from '../../components/factory';
import { getGeom } from '../../geoms/factory';
import BaseConfig, { Label } from '../../interface/config';
import { extractScale } from '../../util/scale';
import SpiderLabel from './component/label/spiderLabel';
import * as EventParser from './event';
import './theme';

export interface PieLayerConfig extends BaseConfig {
  angleField: string;
  colorField?: string;
  radius?: number;
  pieStyle?: {};
}

const G2_GEOM_MAP = {
  pie: 'interval',
};

const PLOT_GEOM_MAP = {
  pie: 'column',
};

export default class PieLayer<T extends PieLayerConfig = PieLayerConfig> extends ViewLayer<T> {
  public pie: any;
  public spiderLabel: any;

  protected geometryParser(dim, type) {
    if (dim === 'g2') {
      return G2_GEOM_MAP[type];
    }
    return PLOT_GEOM_MAP[type];
  }

  protected setType() {
    this.type = 'pie';
  }

  protected _setDefaultG2Config() {}

  protected _scale() {
    const props = this.initialProps;
    const scales = {};
    /** 配置x-scale */
    scales[props.angleField] = {};
    if (_.has(props, 'xAxis')) {
      extractScale(scales[props.angleField], props.xAxis);
    }
    super._scale();
  }

  protected _axis() {}

  protected _coord() {
    const props = this.initialProps;
    const coordConfig = {
      type: 'theta' as CoordinateType,
      cfg: {
        radius: 0.8, // default radius值
      },
    };
    if (_.has(props, 'radius')) {
      coordConfig.cfg.radius = props.radius;
    }
    this.setConfig('coord', coordConfig);
  }

  protected _addGeometry() {
    const props = this.initialProps;
    this._adjustPieStyle();
    const pie = getGeom('interval', 'main', {
      plot: this,
      positionFields: [props.angleField],
    });
    pie.adjust = [{ type: 'stack' }];
    this.pie = pie;
    if (props.label) {
      this._label();
    }
    this.setConfig('element', pie);
  }

  protected _animation() {
    const props = this.initialProps;
    if (props.animation === false) {
      /** 关闭动画 */
      this.pie.animate = false;
    }
  }

  protected _annotation() {}

  protected _events(eventParser) {
    super._events(EventParser);
  }

  protected afterInit() {
    super.afterInit();
    const props = this.initialProps;
    /** 蜘蛛布局label */
    if (props.label && props.label.visible) {
      const labelConfig = props.label as Label;
      if (labelConfig.type === 'spider') {
        const spiderLabel = new SpiderLabel({
          view: this.plot,
          fields: props.colorField ? [props.angleField, props.colorField] : [props.angleField],
          style: labelConfig.style ? labelConfig.style : {},
          formatter: props.label.formatter ? props.label.formatter : false,
          offsetX: props.label.offsetX,
          offsetY: props.label.offsetY,
        });
        this.spiderLabel = spiderLabel;
      }
    }
  }

  private _adjustPieStyle() {
    const props = this.initialProps;
    if (!props.colorField) {
      const defaultStyle = { stroke: 'white', lineWidth: 1 };
      if (!props.pieStyle) {
        props.pieStyle = {};
      }
      props.pieStyle = _.deepMix(props.pieStyle, defaultStyle);
    }
  }

  private _label() {
    const props = this.initialProps;
    const labelConfig = props.label as Label;
    if (!this._showLabel()) {
      this.pie.label = false;
      return;
    }
    if (labelConfig.type === 'inner') {
      const offsetBase = -2;
      labelConfig.offset = labelConfig.offset ? offsetBase + labelConfig.offset : offsetBase;
    }

    // 此处做个 hack 操作, 防止g2 controller层找不到未注册的inner,outter,和spider Label
    let labelType = labelConfig.type;
    if (['inner', 'outter', 'spider'].indexOf(labelType) !== -1) {
      labelType = null;
    }
    this.pie.label = getComponent('label', {
      plot: this,
      labelType,
      fields: props.colorField ? [props.angleField, props.colorField] : [props.angleField],
      ...labelConfig,
    });
  }

  private _showLabel() {
    const props = this.initialProps;
    return props.label && props.label.visible === true && props.label.type !== 'spider';
  }
}
