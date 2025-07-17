# by16

A trivial linear-time algorithm to compute the average colors of an image, grouped
into clusters based on their 4-bit color representation.

![example skyline r-34](./media/example-skyline-r-34.png)

This algorithm is designed for speed rather than flexibility or quality. It uses
16 fixed clusters (based on 4-bit color, i.e. 2⁴ combinations) and can process
images at runtime with minimal overhead.

![clusters chart](./media/clusters-chart.svg)

The following image displays a 3D representation of the HSL color model,
alongside its counterpart averaged into the 16 clusters.

![color space](./media/color-space.png)
![color space clusters](./media/color-space-clusters.png)
