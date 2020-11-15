import React, { useState, useEffect } from "react";
import Graph from "./graph/Graph";
import Explanation from "./Explanation";
import Title from "./Title";
import intensity, {Utilities} from "./api/denkicarbon";
import LocationUtils from './api/location'

import { Box, Container, Typography, Divider } from "@material-ui/core";

const supportedUtilities: Utilities[] = [
  Utilities.Tepco,
  Utilities.Kepco,
  Utilities.Tohokuden,
  Utilities.Chuden,
  Utilities.Hepco,
  Utilities.Rikuden,
  Utilities.Cepco,
  Utilities.Yonden,
  Utilities.Kyuden,
  Utilities.Okiden,
];

const carbonIntensityColor = (carbonIntensity: number): string => {
  const maxIntensity = 900;
  const hueCalc = 100 - Math.floor((carbonIntensity / maxIntensity) * 100);
  const hue = hueCalc > 0 ? hueCalc : 0;
  console.log(`hsl(${hue},100%,100%)`);
  return `hsl(${hue},100%,50%)`;
};

export default function Main() {
  const date = new Date();
  const hourIndex = date.getHours();
  const month: number = date.getMonth() + 1;

  // Utility Choice
  const [utility, setUtility] = useState(supportedUtilities[0]);
  useEffect(() => {
    LocationUtils.fetchUtilityBasedOnGeolocation(LocationUtils.utilityGeocoordinates, setUtility);
  }, []);

  // Monthly Data
  const [
    dailyCarbonByMonth,
    setDailyCarbonByMonth,
  ] = useState(intensity.byMonth.default);
  useEffect(() => {
    intensity.byMonth.retrive(setDailyCarbonByMonth, utility);
  }, [utility]);
  
  
  // Forecast
  const [
    intensityForecast,
    setIntensityForecast,
  ] = useState(intensity.forecast.default)
  useEffect(() => {
    intensity.forecast.retrive(setIntensityForecast, utility)
  }, [utility])

  const todaysForecastData = intensity.forecast.findTodaysData(intensityForecast)

  // Set Big Number
  const carbonIntensity =
    Math.round(
      todaysForecastData[hourIndex]?.forecast_value
    ) || 0;

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Title
          updateUtility={setUtility}
          utilityIndex={supportedUtilities.indexOf(utility)}
          supportedUtilities={supportedUtilities}
        />
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          style={{
            display: "inline-block",
            color: carbonIntensityColor(carbonIntensity),
          }}
        >
          {carbonIntensity}
        </Typography>
        <Typography style={{ display: "inline-block" }}>gC02/kWh</Typography>
        <Graph 
          monthData={dailyCarbonByMonth ?? null}
          forecastData={todaysForecastData ?? null}
        />
        <Divider variant="middle" />
        <Explanation />
      </Box>
    </Container>
  );
}
