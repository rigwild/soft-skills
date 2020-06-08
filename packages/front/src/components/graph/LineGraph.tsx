import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Boost from "highcharts/modules/boost";
import React from "react";

type Props = {
  point?: boolean;
  title: string;
  xAxis: string;
  yAxis: string;
  dataName: string;
  data: Array<number[]>;
  valueSuffix?: string;
};

const LineGraph = (props: Props) => (
  <HighchartsReact
    highcharts={Boost(Highcharts)}
    options={{
      chart: {
        type: "line",
        zoomType: "x",
      },
      title: {
        text: props.title,
      },
      xAxis: {
        title: {
          text: props.xAxis,
        },
      },
      yAxis: {
        title: {
          text: props.yAxis,
        },
      },
      series: [
        {
          name: props.dataName,
          data: props.data,
          ...(props.point && {
            lineWidth: 0,
            marker: {
              enabled: true,
              radius: 3,
            },
            tooltip: {
              valueDecimals: 2,
            },
            states: {
              hover: {
                lineWidthPlus: 0,
              },
            },
          }),
        },
      ],
      credits: {
        enabled: false,
      },
      legend: { enabled: false },
      tooltip: {
        valueSuffix: props.valueSuffix && ` ${props.valueSuffix}`,
      },
    }}
  />
);

export default LineGraph;
