import { Shape } from '@antv/g';
import * as _ from '@antv/util';
import textHide from './textHide';

export default function nodesResamplingByState(shape: Shape, option, index, cfg) {
  const nodes = cfg.nodes.nodes;
  const current = nodes[index];
  if (current.line) {
    current.line.remove();
  }

  const data = cfg.plot.initialProps.data;
  const field = cfg.plot[cfg.plot.type].label.fields[0];
  const stateNodes = getStateNodes(data, field, nodes);

  let isState = false;
  _.each(stateNodes, (node) => {
    // @ts-ignore
    if (node.shape.get('origin') === current.shape.get('origin')) {
      isState = true;
    }
  });
  if (isState) {
    if (current.origin_position) {
      const { x, y } = current.origin_position;
      shape.attr('x', x);
      shape.attr('y', y);
    }
  } else {
    textHide(shape);
  }
}

function getStateNodes(data, field, nodes) {
  const extract_data = [];
  _.each(data, (d) => {
    extract_data.push(d[field]);
  });
  extract_data.sort((a, b) => {
    return a - b;
  });
  const min = extract_data[0];
  const min_node = getNodeByNumber(nodes, field, min);
  const max = extract_data[extract_data.length - 1];
  const max_node = getNodeByNumber(nodes, field, max);
  const median = getMedian(extract_data);
  const median_node = getNodeByNumber(nodes, field, median);

  return { min: min_node, max: max_node, median: median_node };
}

function getMedian(array) {
  const list = _.clone(array);
  list.sort((a, b) => {
    return a - b;
  });

  const half = Math.floor(list.length / 2);

  if (list.length % 2) {
    return list[half];
  }

  return list[half];
}

function getNodeByNumber(nodes, field, num) {
  for (const node of nodes) {
    const d = node.shape.get('origin');
    if (d[field] === num) {
      return node;
    }
  }
}
