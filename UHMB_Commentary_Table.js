/*globals define*/
define(["qlik", "jquery", "text!./style.css"], function (qlik, $, cssContent) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");
	function createRows(rows, dimensionInfo) {
		var html = "";
		rows.forEach(function (row) {
			html += '<tr>';
			row.forEach(function (cell, key) {
				if (cell.qIsOtherCell) {
					cell.qText = dimensionInfo[key].othersLabel;
				}
				html += "<td ";
				if (!isNaN(cell.qNum)) {
					html += "class='numeric'";
				}
				if (key == 0){
					html += " style='font-weight: bold;'"
				}
				html += '>' + cell.qText + '</td>';
			});
			html += '</tr>';
		});
		return html;
	}

	return {
		initialProperties: {
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 10,
					qHeight: 50
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 1
				},
				measures: {
					uses: "measures",
					min: 3,
					max: 3
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings"
				},
				customSection: {
					component: "expandable-items",
					label: "Formatting",
					items: {
						Header1: {
							type: "items",
							label: "Settings",
							items: {
								
								DefaultFont: {
									type: "boolean",
									label: "Use Default Font/Size",
									ref: "DefaultFontFlag",
									defaultValue: true
								},
								CustomFontSizeHeader: {
									ref: "CustFontSizeHeader",
									type: "string",
									label: "Header Custom Font Size",
									expression: "optional",
									defaultValue: "14px",
									show: function (data) {
										return !data.DefaultFontFlag;
									}

								},
								CustomFontFamilyHeader: {
									ref: "CustomFontFamilyHeader",
									type: "string",
									label: "Header Custom Font Family",
									expression: "optional",
									defaultValue: "Arial, Helvetica, sans-serif",
									show: function (data) {
										return !data.DefaultFontFlag;
									}

								},
								CustomFontColHeader: {
									label: "Header Custom Colour",
									component: "color-picker",
									ref: "CustomFontColHeader",
									type: "object",
	
									defaultValue: {
										color: "#ffffff",
										index: "-1"
									},
									show: function (data) {
										return !data.DefaultFontFlag;
									}
								},
								CustomFontSizeBody: {
									ref: "CustFontSizeBody",
									type: "string",
									label: "Body Custom Font Size (CSS)",
									expression: "optional",
									defaultValue: "14px",
									show: function (data) {
										return !data.DefaultFontFlag;
									}

								},
								CustomFontFamilyBody: {
									ref: "CustomFontFamilyBody",
									type: "string",
									label: "Body Custom Font Family (CSS)",
									expression: "optional",
									defaultValue: "Arial, Helvetica, sans-serif",
									show: function (data) {
										return !data.DefaultFontFlag;
									}

								},
								CustomFontColBody: {
									label: "Body Custom Colour",
									component: "color-picker",
									ref: "CustomFontColBody",
									type: "object",
	
									defaultValue: {
										color: "#ffffff",
										index: "-1"
									},
									show: function (data) {
										return !data.DefaultFontFlag;
									}
								}

							}
						

						}
					}
				},abouttxt: {
					label: "About",
					type: "items",
					items: {
						abouttxt2: {
							label: "About",
							type: "items",
							items: {
								aboutt: {
									component: "text",
									label: "UHMB Commenary Display Extension developed by Dale Wright"
								},
								about2: {
									component: "link",
									label: "CSS Font Family Documentation",
									url:"https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#examples"

								},
								about3: {
									component: "link",
									label: "GitHub for Extension",
									url: "https://github.com/DizzleWizzle/UHMB_Commentary_Table"
								}
							}
						}
					}
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ($element, layout) {
			var defFont = layout.DefaultFontFlag;
			var HeaderStyle= '';
			var BodyStyle = '';
			if(defFont == false){
				HeaderStyle = `style = "font-size:${layout.CustFontSizeHeader}; font-family:${layout.CustomFontFamilyHeader};color: ${layout.CustomFontColHeader.color};"`;
				BodyStyle = `style = "font-size:${layout.CustFontSizeBody}; font-family:${layout.CustomFontFamilyBody};color: ${layout.CustomFontColBody.color};"`;
			}

			var html = `<table ><thead ${HeaderStyle}><tr>`, self = this,
				morebutton = false,
				hypercube = layout.qHyperCube,
				rowcount = hypercube.qDataPages[0].qMatrix.length,
				colcount = hypercube.qDimensionInfo.length + hypercube.qMeasureInfo.length;
			//render titles

			hypercube.qDimensionInfo.forEach(function (cell) {
				html += '<th>' + cell.qFallbackTitle + '</th>';
			});
			hypercube.qMeasureInfo.forEach(function (cell) {
				html += '<th>' + cell.qFallbackTitle + '</th>';
			});
			html += `</tr></thead><tbody ${BodyStyle}>`;
			//render data
			html += createRows(hypercube.qDataPages[0].qMatrix, hypercube.qDimensionInfo);
			html += "</tbody></table>";
			//add 'more...' button
			if (hypercube.qSize.qcy > rowcount) {
				html += "<button class='more'>More...</button>";
				morebutton = true;
			}
			$element.html(html);
			if (morebutton) {
				$element.find(".more").on("click", function () {
					var requestPage = [{
						qTop: rowcount,
						qLeft: 0,
						qWidth: colcount,
						qHeight: Math.min(50, hypercube.qSize.qcy - rowcount)
					}];
					self.backendApi.getData(requestPage).then(function (dataPages) {
						rowcount += dataPages[0].qMatrix.length;
						if (rowcount >= hypercube.qSize.qcy) {
							$element.find(".more").hide();
						}
						var html = createRows(dataPages[0].qMatrix, hypercube.qDimensionInfo);
						$element.find("tbody").append(html);
					});
				});
			}
			return qlik.Promise.resolve();
		}
	};
});
