import { Diagram } from '../../Diagram.js';
import * as configApi from '../../config.js';
import { calculateBlockSizes, insertBlocks } from './renderHelpers.js';
import { layout } from './layout.js';
import { setupGraphViewbox } from '../../setupGraphViewbox.js';
import {
  select as d3select,
  scaleOrdinal as d3scaleOrdinal,
  schemeTableau10 as d3schemeTableau10,
} from 'd3';
import { log } from '../../logger.js';

import { BlockDB } from './blockDB.js';
import type { Block } from './blockTypes.js';

// import { diagram as BlockDiagram } from './blockDiagram.js';
import { configureSvgSize } from '../../setupGraphViewbox.js';

export const draw = async function (
  text: string,
  id: string,
  _version: string,
  diagObj: Diagram
): Promise<void> {
  const { securityLevel, flowchart: conf } = configApi.getConfig();
  const db = diagObj.db as BlockDB;
  let sandboxElement: any;
  if (securityLevel === 'sandbox') {
    sandboxElement = d3select('#i' + id);
  }
  const root =
    securityLevel === 'sandbox'
      ? d3select(sandboxElement.nodes()[0].contentDocument.body)
      : d3select('body');

  // @ts-ignore TODO root.select is not callable
  const svg = securityLevel === 'sandbox' ? root.select(`[id="${id}"]`) : d3select(`[id="${id}"]`);

  const bl = db.getBlocks();

  const nodes = svg.insert('g').attr('class', 'block');
  await calculateBlockSizes(nodes, bl, db);
  const bounds = layout(db);
  log.debug('Here blocks', bl);
  await insertBlocks(nodes, bl, db);

  // log.debug('Here', bl);

  // Establish svg dimensions and get width and height
  //
  // const bounds2 = nodes.node().getBoundingClientRect();
  // Why, oh why ????
  if (bounds) {
    const bounds2 = bounds;
    const magicFactor = Math.max(1, Math.round(0.125 * (bounds2.width / bounds2.height)));
    const height = bounds2.height + magicFactor + 10;
    const width = bounds2.width + 10;
    const useMaxWidth = false;
    configureSvgSize(svg, height, width, useMaxWidth);
    log.debug('Here Bounds', bounds, bounds2);
    svg.attr(
      'viewBox',
      `${bounds2.x - 5} ${bounds2.y - 5} ${bounds2.width + 10} ${bounds2.height + 10}`
    );
  }
  // svg.attr('viewBox', `${-200} ${-200} ${400} ${400}`);

  // Prepare data for construction based on diagObj.db
  // This must be a mutable object with `nodes` and `links` properties:
  //
  // @ts-ignore TODO: db type
  // const graph = diagObj.db.getGraph();

  // const nodeWidth = 10;

  // Create rectangles for nodes
  // const db:BlockDB = diagObj.db;

  interface LayedBlock extends Block {
    children?: LayedBlock[];
    x?: number;
    y?: number;
  }

  // Get color scheme for the graph
  const colorScheme = d3scaleOrdinal(d3schemeTableau10);
};

export default {
  draw,
};