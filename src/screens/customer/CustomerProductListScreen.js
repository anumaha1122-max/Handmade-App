


// src/screens/customer/CustomerProductListScreen.js

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import { COLORS } from "../../constants/colors";
import { useShop } from "../../context/ShopContext";

const placeholder = require("../../../assets/images/placeholder.png");

const imageMap = {
  tote1: require("../../../assets/images/bags/tote/tote1.png"),
  tote2: require("../../../assets/images/bags/tote/tote2.png"),
  tote3: require("../../../assets/images/bags/tote/tote3.png"),
  tote4: require("../../../assets/images/bags/tote/tote4.png"),
  tote5: require("../../../assets/images/bags/tote/tote5.png"),

  jute1: require("../../../assets/images/bags/jute/jute1.png"),
  jute2: require("../../../assets/images/bags/jute/jute2.png"),
  jute3: require("../../../assets/images/bags/jute/jute3.png"),
  jute4: require("../../../assets/images/bags/jute/jute4.png"),
  jute5: require("../../../assets/images/bags/jute/jute5.png"),

  sling1: require("../../../assets/images/bags/sling/sling1.png"),
  sling2: require("../../../assets/images/bags/sling/sling2.png"),
  sling3: require("../../../assets/images/bags/sling/sling3.png"),
  sling4: require("../../../assets/images/bags/sling/sling4.png"),
  sling5: require("../../../assets/images/bags/sling/sling5.png"),

  potli1: require("../../../assets/images/bags/potli/potli1.png"),
  potli2: require("../../../assets/images/bags/potli/potli2.png"),
  potli3: require("../../../assets/images/bags/potli/potli3.png"),
  potli4: require("../../../assets/images/bags/potli/potli4.png"),
  potli5: require("../../../assets/images/bags/potli/potli5.png"),

  scented1: require("../../../assets/images/candles/scented/scented1.png"),
  scented2: require("../../../assets/images/candles/scented/scented2.png"),
  scented3: require("../../../assets/images/candles/scented/scented3.png"),
  scented4: require("../../../assets/images/candles/scented/scented4.png"),
  scented5: require("../../../assets/images/candles/scented/scented5.png"),

  candleDecor1: require("../../../assets/images/candles/decor/decor1.png"),
  candleDecor2: require("../../../assets/images/candles/decor/decor2.png"),
  candleDecor3: require("../../../assets/images/candles/decor/decor3.png"),
  candleDecor4: require("../../../assets/images/candles/decor/decor4.png"),
  candleDecor5: require("../../../assets/images/candles/decor/decor5.png"),

  gel1: require("../../../assets/images/candles/gel/gel1.png"),
  gel2: require("../../../assets/images/candles/gel/gel2.png"),
  gel3: require("../../../assets/images/candles/gel/gel3.png"),
  gel4: require("../../../assets/images/candles/gel/gel4.png"),
  gel5: require("../../../assets/images/candles/gel/gel5.png"),

  floating1: require("../../../assets/images/candles/floating/floating1.png"),
  floating2: require("../../../assets/images/candles/floating/floating2.png"),
  floating3: require("../../../assets/images/candles/floating/floating3.png"),
  floating4: require("../../../assets/images/candles/floating/floating4.png"),
  floating5: require("../../../assets/images/candles/floating/floating5.png"),

  greeting1: require("../../../assets/images/cards/greeting/greeting1.png"),
  greeting2: require("../../../assets/images/cards/greeting/greeting2.png"),
  greeting3: require("../../../assets/images/cards/greeting/greeting3.png"),
  greeting4: require("../../../assets/images/cards/greeting/greeting4.png"),
  greeting5: require("../../../assets/images/cards/greeting/greeting5.png"),

  birthday1: require("../../../assets/images/cards/birthday/birthday1.png"),
  birthday2: require("../../../assets/images/cards/birthday/birthday2.png"),
  birthday3: require("../../../assets/images/cards/birthday/birthday3.png"),
  birthday4: require("../../../assets/images/cards/birthday/birthday4.png"),
  birthday5: require("../../../assets/images/cards/birthday/birthday5.png"),

  wedding1: require("../../../assets/images/cards/wedding/wedding1.png"),
  wedding2: require("../../../assets/images/cards/wedding/wedding2.png"),
  wedding3: require("../../../assets/images/cards/wedding/wedding3.png"),
  wedding4: require("../../../assets/images/cards/wedding/wedding4.png"),
  wedding5: require("../../../assets/images/cards/wedding/wedding5.png"),

  thanks1: require("../../../assets/images/cards/thanks/thanks1.png"),
  thanks2: require("../../../assets/images/cards/thanks/thanks2.png"),
  thanks3: require("../../../assets/images/cards/thanks/thanks3.png"),
  thanks4: require("../../../assets/images/cards/thanks/thanks4.png"),
  thanks5: require("../../../assets/images/cards/thanks/thanks5.png"),

  wall1: require("../../../assets/images/decor/wall/wall1.png"),
  wall2: require("../../../assets/images/decor/wall/wall2.png"),
  wall3: require("../../../assets/images/decor/wall/wall3.png"),
  wall4: require("../../../assets/images/decor/wall/wall4.png"),
  wall5: require("../../../assets/images/decor/wall/wall5.png"),

  table1: require("../../../assets/images/decor/table/table1.png"),
  table2: require("../../../assets/images/decor/table/table2.png"),
  table3: require("../../../assets/images/decor/table/table3.png"),
  table4: require("../../../assets/images/decor/table/table4.png"),
  table5: require("../../../assets/images/decor/table/table5.png"),

  door1: require("../../../assets/images/decor/door/door1.png"),
  door2: require("../../../assets/images/decor/door/door2.png"),
  door3: require("../../../assets/images/decor/door/door3.png"),
  door4: require("../../../assets/images/decor/door/door4.png"),
  door5: require("../../../assets/images/decor/door/door5.png"),

  showpiece1: require("../../../assets/images/decor/showpiece/showpiece1.png"),
  showpiece2: require("../../../assets/images/decor/showpiece/showpiece2.png"),
  showpiece3: require("../../../assets/images/decor/showpiece/showpiece3.png"),
  showpiece4: require("../../../assets/images/decor/showpiece/showpiece4.png"),
  showpiece5: require("../../../assets/images/decor/showpiece/showpiece5.png"),

  frock1: require("../../../assets/images/dresees/frocks/frock1.png"),
  frock2: require("../../../assets/images/dresees/frocks/frock2.png"),
  frock3: require("../../../assets/images/dresees/frocks/frock3.png"),
  frock4: require("../../../assets/images/dresees/frocks/frock4.png"),
  frock5: require("../../../assets/images/dresees/frocks/frock5.png"),

  kurti1: require("../../../assets/images/dresees/kurti/kurti1.png"),
  kurti2: require("../../../assets/images/dresees/kurti/kurti2.png"),
  kurti3: require("../../../assets/images/dresees/kurti/kurti3.png"),
  kurti4: require("../../../assets/images/dresees/kurti/kurti4.png"),
  kurti5: require("../../../assets/images/dresees/kurti/kurti5.png"),

  saree1: require("../../../assets/images/dresees/sarees/saree1.png"),
  saree2: require("../../../assets/images/dresees/sarees/saree2.png"),
  saree3: require("../../../assets/images/dresees/sarees/saree3.png"),
  saree4: require("../../../assets/images/dresees/sarees/saree4.png"),
  saree5: require("../../../assets/images/dresees/sarees/saree5.png"),

  lehenga1: require("../../../assets/images/dresees/lehengas/lehenga1.png"),
  lehenga2: require("../../../assets/images/dresees/lehengas/lehenga2.png"),
  lehenga3: require("../../../assets/images/dresees/lehengas/lehenga3.png"),
  lehenga4: require("../../../assets/images/dresees/lehengas/lehenga4.png"),
  lehenga5: require("../../../assets/images/dresees/lehengas/lehenga5.png"),

  sweater1: require("../../../assets/images/dresees/sweaters/sweater1.png"),
  sweater2: require("../../../assets/images/dresees/sweaters/sweater2.png"),
  sweater3: require("../../../assets/images/dresees/sweaters/sweater3.png"),
  sweater4: require("../../../assets/images/dresees/sweaters/sweater4.png"),
  sweater5: require("../../../assets/images/dresees/sweaters/sweater5.png"),

  ganesh1: require("../../../assets/images/festive/ganesh/ganesh1.png"),
  ganesh2: require("../../../assets/images/festive/ganesh/ganesh2.png"),
  ganesh3: require("../../../assets/images/festive/ganesh/ganesh3.png"),
  ganesh4: require("../../../assets/images/festive/ganesh/ganesh4.png"),
  ganesh5: require("../../../assets/images/festive/ganesh/ganesh5.png"),

  rakhi1: require("../../../assets/images/festive/rakhis/rakhi1.png"),
  rakhi2: require("../../../assets/images/festive/rakhis/rakhi2.png"),
  rakhi3: require("../../../assets/images/festive/rakhis/rakhi3.png"),
  rakhi4: require("../../../assets/images/festive/rakhis/rakhi4.png"),
  rakhi5: require("../../../assets/images/festive/rakhis/rakhi5.png"),

  navratri1: require("../../../assets/images/festive/navratri/navratri1.png"),
  navratri2: require("../../../assets/images/festive/navratri/navratri2.png"),
  navratri3: require("../../../assets/images/festive/navratri/navratri3.png"),
  navratri4: require("../../../assets/images/festive/navratri/navratri4.png"),
  navratri5: require("../../../assets/images/festive/navratri/navratri5.png"),

  christmas1: require("../../../assets/images/festive/christmas/christmas1.png"),
  christmas2: require("../../../assets/images/festive/christmas/christmas2.png"),
  christmas3: require("../../../assets/images/festive/christmas/christmas3.png"),
  christmas4: require("../../../assets/images/festive/christmas/christmas4.png"),
  christmas5: require("../../../assets/images/festive/christmas/christmas5.png"),

  diya1: require("../../../assets/images/festive/diya/diya1.png"),
  diya2: require("../../../assets/images/festive/diya/diya2.png"),
  diya3: require("../../../assets/images/festive/diya/diya3.png"),
  diya4: require("../../../assets/images/festive/diya/diya4.png"),
  diya5: require("../../../assets/images/festive/diya/diya5.png"),

  rangoli1: require("../../../assets/images/festive/rangoli/rangoli1.png"),
  rangoli2: require("../../../assets/images/festive/rangoli/rangoli2.png"),
  rangoli3: require("../../../assets/images/festive/rangoli/rangoli3.png"),
  rangoli4: require("../../../assets/images/festive/rangoli/rangoli4.png"),
  rangoli5: require("../../../assets/images/festive/rangoli/rangoli5.png"),

  pooja1: require("../../../assets/images/festive/pooja/pooja1.png"),
  pooja2: require("../../../assets/images/festive/pooja/pooja2.png"),
  pooja3: require("../../../assets/images/festive/pooja/pooja3.png"),
  pooja4: require("../../../assets/images/festive/pooja/pooja4.png"),
  pooja5: require("../../../assets/images/festive/pooja/pooja5.png"),

  lantern1: require("../../../assets/images/festive/lantern/lantern1.png"),
  lantern2: require("../../../assets/images/festive/lantern/lantern2.png"),
  lantern3: require("../../../assets/images/festive/lantern/lantern3.png"),
  lantern4: require("../../../assets/images/festive/lantern/lantern4.png"),
  lantern5: require("../../../assets/images/festive/lantern/lantern5.png"),

  earring1: require("../../../assets/images/jewelry/earring/earring1.png"),
  earring2: require("../../../assets/images/jewelry/earring/earring2.png"),
  earring3: require("../../../assets/images/jewelry/earring/earring3.png"),
  earring4: require("../../../assets/images/jewelry/earring/earring4.png"),
  earring5: require("../../../assets/images/jewelry/earring/earring5.png"),

  necklace1: require("../../../assets/images/jewelry/necklace/necklace1.png"),
  necklace2: require("../../../assets/images/jewelry/necklace/necklace2.png"),
  necklace3: require("../../../assets/images/jewelry/necklace/necklace3.png"),
  necklace4: require("../../../assets/images/jewelry/necklace/necklace4.png"),
  necklace5: require("../../../assets/images/jewelry/necklace/necklace5.png"),

  bangle1: require("../../../assets/images/jewelry/bangle/bangle1.png"),
  bangle2: require("../../../assets/images/jewelry/bangle/bangle2.png"),
  bangle3: require("../../../assets/images/jewelry/bangle/bangle3.png"),
  bangle4: require("../../../assets/images/jewelry/bangle/bangle4.png"),
  bangle5: require("../../../assets/images/jewelry/bangle/bangle5.png"),

  anklet1: require("../../../assets/images/jewelry/anklet/anklet1.png"),
  anklet2: require("../../../assets/images/jewelry/anklet/anklet2.png"),
  anklet3: require("../../../assets/images/jewelry/anklet/anklet3.png"),
  anklet4: require("../../../assets/images/jewelry/anklet/anklet4.png"),
  anklet5: require("../../../assets/images/jewelry/anklet/anklet5.png"),

  canvas1: require("../../../assets/images/paintings/canvas/canvas1.png"),
  canvas2: require("../../../assets/images/paintings/canvas/canvas2.png"),
  canvas3: require("../../../assets/images/paintings/canvas/canvas3.png"),
  canvas4: require("../../../assets/images/paintings/canvas/canvas4.png"),
  canvas5: require("../../../assets/images/paintings/canvas/canvas5.png"),

  madhubani1: require("../../../assets/images/paintings/madhubani/madhubani1.png"),
  madhubani2: require("../../../assets/images/paintings/madhubani/madhubani2.png"),
  madhubani3: require("../../../assets/images/paintings/madhubani/madhubani3.png"),
  madhubani4: require("../../../assets/images/paintings/madhubani/madhubani4.png"),
  madhubani5: require("../../../assets/images/paintings/madhubani/madhubani5.png"),

  warli1: require("../../../assets/images/paintings/warli/warli1.png"),
  warli2: require("../../../assets/images/paintings/warli/warli2.png"),
  warli3: require("../../../assets/images/paintings/warli/warli3.png"),
  warli4: require("../../../assets/images/paintings/warli/warli4.png"),
  warli5: require("../../../assets/images/paintings/warli/warli5.png"),

  mini1: require("../../../assets/images/paintings/mini/mini1.png"),
  mini2: require("../../../assets/images/paintings/mini/mini2.png"),
  mini3: require("../../../assets/images/paintings/mini/mini3.png"),
  mini4: require("../../../assets/images/paintings/mini/mini4.png"),
  mini5: require("../../../assets/images/paintings/mini/mini5.png"),

  mango1: require("../../../assets/images/pickles/mango/mango1.png"),
  mango2: require("../../../assets/images/pickles/mango/mango2.png"),
  mango3: require("../../../assets/images/pickles/mango/mango3.png"),
  mango4: require("../../../assets/images/pickles/mango/mango4.png"),
  mango5: require("../../../assets/images/pickles/mango/mango5.png"),

  lemon1: require("../../../assets/images/pickles/lemon/lemon1.png"),
  lemon2: require("../../../assets/images/pickles/lemon/lemon2.png"),
  lemon3: require("../../../assets/images/pickles/lemon/lemon3.png"),
  lemon4: require("../../../assets/images/pickles/lemon/lemon4.png"),
  lemon5: require("../../../assets/images/pickles/lemon/lemon5.png"),

  gongura1: require("../../../assets/images/pickles/gongura/gongura1.png"),
  gongura2: require("../../../assets/images/pickles/gongura/gongura2.png"),
  gongura3: require("../../../assets/images/pickles/gongura/gongura3.png"),
  gongura4: require("../../../assets/images/pickles/gongura/gongura4.png"),
  gongura5: require("../../../assets/images/pickles/gongura/gongura5.png"),

  mixed1: require("../../../assets/images/pickles/mixed/mixed1.png"),
  mixed2: require("../../../assets/images/pickles/mixed/mixed2.png"),
  mixed3: require("../../../assets/images/pickles/mixed/mixed3.png"),
  mixed4: require("../../../assets/images/pickles/mixed/mixed4.png"),
  mixed5: require("../../../assets/images/pickles/mixed/mixed5.png"),

  pot1: require("../../../assets/images/pottery/pot/pot1.png"),
  pot2: require("../../../assets/images/pottery/pot/pot2.png"),
  pot3: require("../../../assets/images/pottery/pot/pot3.png"),
  pot4: require("../../../assets/images/pottery/pot/pot4.png"),
  pot5: require("../../../assets/images/pottery/pot/pot5.png"),

  vase1: require("../../../assets/images/pottery/vase/vase1.png"),
  vase2: require("../../../assets/images/pottery/vase/vase2.png"),
  vase3: require("../../../assets/images/pottery/vase/vase3.png"),
  vase4: require("../../../assets/images/pottery/vase/vase4.png"),
  vase5: require("../../../assets/images/pottery/vase/vase5.png"),

  cup1: require("../../../assets/images/pottery/cup/cup1.png"),
  cup2: require("../../../assets/images/pottery/cup/cup2.png"),
  cup3: require("../../../assets/images/pottery/cup/cup3.png"),
  cup4: require("../../../assets/images/pottery/cup/cup4.png"),
  cup5: require("../../../assets/images/pottery/cup/cup5.png"),

  planter1: require("../../../assets/images/pottery/planter/planter1.png"),
  planter2: require("../../../assets/images/pottery/planter/planter2.png"),
  planter3: require("../../../assets/images/pottery/planter/planter3.png"),
  planter4: require("../../../assets/images/pottery/planter/planter4.png"),
  planter5: require("../../../assets/images/pottery/planter/planter5.png"),

  laddu1: require("../../../assets/images/sweets/laddu/laddu1.png"),
  laddu2: require("../../../assets/images/sweets/laddu/laddu2.png"),
  laddu3: require("../../../assets/images/sweets/laddu/laddu3.png"),
  laddu4: require("../../../assets/images/sweets/laddu/laddu4.png"),
  laddu5: require("../../../assets/images/sweets/laddu/laddu5.png"),

  halwa1: require("../../../assets/images/sweets/halwa/halwa1.png"),
  halwa2: require("../../../assets/images/sweets/halwa/halwa2.png"),
  halwa3: require("../../../assets/images/sweets/halwa/halwa3.png"),
  halwa4: require("../../../assets/images/sweets/halwa/halwa4.png"),
  halwa5: require("../../../assets/images/sweets/halwa/halwa5.png"),

  traditional1: require("../../../assets/images/sweets/traditional/traditional1.png"),
  traditional2: require("../../../assets/images/sweets/traditional/traditional2.png"),
  traditional3: require("../../../assets/images/sweets/traditional/traditional3.png"),
  traditional4: require("../../../assets/images/sweets/traditional/traditional4.png"),
  traditional5: require("../../../assets/images/sweets/traditional/traditional5.png"),

  dryfruit1: require("../../../assets/images/sweets/dryfruit/dryfruit1.png"),
  dryfruit2: require("../../../assets/images/sweets/dryfruit/dryfruit2.png"),
  dryfruit3: require("../../../assets/images/sweets/dryfruit/dryfruit3.png"),
  dryfruit4: require("../../../assets/images/sweets/dryfruit/dryfruit4.png"),
  dryfruit5: require("../../../assets/images/sweets/dryfruit/dryfruit5.png"),
};

// ─── Category Data ────────────────────────────────────────────────────────────
const CATEGORY_DATA = {
  Bags: {
    title: "Bag Types",
    subtitle: "Choose handmade bag category",
    subcategories: {
      "Tote Bags": [
        ["tote1", "Handmade Cotton Tote Bag", "₹499", "4.7"],
        ["tote2", "Printed Market Tote Bag", "₹599", "4.6"],
        ["tote3", "Canvas Daily Tote Bag", "₹699", "4.8"],
        ["tote4", "Eco Friendly Tote Bag", "₹449", "4.5"],
        ["tote5", "Designer Handmade Tote", "₹799", "4.9"],
      ],
      "Jute Bags": [
        ["jute1", "Natural Jute Shopping Bag", "₹399", "4.6"],
        ["jute2", "Printed Jute Carry Bag", "₹499", "4.7"],
        ["jute3", "Festival Jute Gift Bag", "₹349", "4.5"],
        ["jute4", "Hand Painted Jute Bag", "₹699", "4.8"],
        ["jute5", "Premium Jute Handbag", "₹899", "4.9"],
      ],
      "Sling Bags": [
        ["sling1", "Handmade Sling Bag", "₹699", "4.7"],
        ["sling2", "Crochet Sling Bag", "₹799", "4.8"],
        ["sling3", "Boho Style Sling Bag", "₹899", "4.6"],
        ["sling4", "Embroidered Sling Bag", "₹999", "4.9"],
        ["sling5", "Mini Handmade Sling", "₹599", "4.5"],
      ],
      "Potli Bags": [
        ["potli1", "Traditional Potli Bag", "₹299", "4.6"],
        ["potli2", "Mirror Work Potli", "₹399", "4.8"],
        ["potli3", "Wedding Potli Bag", "₹499", "4.9"],
        ["potli4", "Silk Handmade Potli", "₹599", "4.7"],
        ["potli5", "Festive Designer Potli", "₹699", "4.8"],
      ],
    },
  },
  Candles: {
    title: "Candle Types",
    subtitle: "Choose handmade candle category",
    subcategories: {
      "Scented Candles": [
        ["scented1", "Lavender Scented Candle", "₹299", "4.8"],
        ["scented2", "Rose Aroma Candle", "₹249", "4.6"],
        ["scented3", "Vanilla Jar Candle", "₹349", "4.7"],
        ["scented4", "Jasmine Scented Candle", "₹299", "4.5"],
        ["scented5", "Premium Aroma Candle", "₹499", "4.9"],
      ],
      "Decor Candles": [
        ["candleDecor1", "Flower Decor Candle", "₹199", "4.5"],
        ["candleDecor2", "Designer Decor Candle", "₹299", "4.7"],
        ["candleDecor3", "Festival Decor Candle", "₹349", "4.8"],
        ["candleDecor4", "Handmade Pillar Candle", "₹399", "4.6"],
        ["candleDecor5", "Luxury Table Candle", "₹599", "4.9"],
      ],
      "Gel Candles": [
        ["gel1", "Ocean Gel Candle", "₹349", "4.7"],
        ["gel2", "Colorful Gel Candle", "₹299", "4.5"],
        ["gel3", "Glass Jar Gel Candle", "₹399", "4.8"],
        ["gel4", "Floral Gel Candle", "₹449", "4.6"],
        ["gel5", "Premium Gel Candle", "₹599", "4.9"],
      ],
      "Floating Candles": [
        ["floating1", "Rose Floating Candle", "₹199", "4.6"],
        ["floating2", "Festival Floating Candle", "₹249", "4.7"],
        ["floating3", "Lotus Floating Candle", "₹299", "4.8"],
        ["floating4", "Decor Floating Candle", "₹349", "4.5"],
        ["floating5", "Luxury Floating Candle Set", "₹499", "4.9"],
      ],
    },
  },
  Cards: {
    title: "Card Types",
    subtitle: "Choose handmade greeting card category",
    subcategories: {
      "Greeting Cards": [
        ["greeting1", "Handmade Greeting Card", "₹149", "4.6"],
        ["greeting2", "Floral Greeting Card", "₹199", "4.7"],
        ["greeting3", "Cute Handmade Card", "₹129", "4.5"],
        ["greeting4", "Premium Greeting Card", "₹249", "4.8"],
        ["greeting5", "Designer Greeting Card", "₹299", "4.9"],
      ],
      "Birthday Cards": [
        ["birthday1", "Birthday Handmade Card", "₹149", "4.7"],
        ["birthday2", "3D Birthday Card", "₹249", "4.8"],
        ["birthday3", "Kids Birthday Card", "₹129", "4.5"],
        ["birthday4", "Luxury Birthday Card", "₹299", "4.9"],
        ["birthday5", "Floral Birthday Card", "₹199", "4.6"],
      ],
      "Wedding Cards": [
        ["wedding1", "Traditional Wedding Card", "₹399", "4.8"],
        ["wedding2", "Luxury Wedding Invite", "₹599", "4.9"],
        ["wedding3", "Floral Wedding Card", "₹349", "4.6"],
        ["wedding4", "Handmade Invitation Card", "₹499", "4.7"],
        ["wedding5", "Premium Wedding Card", "₹699", "4.9"],
      ],
      "Thank You Cards": [
        ["thanks1", "Simple Thank You Card", "₹99", "4.5"],
        ["thanks2", "Floral Thank You Card", "₹149", "4.7"],
        ["thanks3", "Premium Thank You Card", "₹199", "4.8"],
        ["thanks4", "Cute Thank You Card", "₹129", "4.6"],
        ["thanks5", "Hand Painted Thank You Card", "₹249", "4.9"],
      ],
    },
  },
  Decor: {
    title: "Decor Types",
    subtitle: "Choose handmade home decor category",
    subcategories: {
      "Wall Decor": [
        ["wall1", "Handmade Wall Hanging", "₹499", "4.7"],
        ["wall2", "Macrame Wall Decor", "₹899", "4.8"],
        ["wall3", "Boho Wall Decor", "₹699", "4.6"],
        ["wall4", "Traditional Wall Hanging", "₹799", "4.9"],
        ["wall5", "Wooden Wall Art", "₹999", "4.8"],
      ],
      "Table Decor": [
        ["table1", "Handmade Table Decor", "₹299", "4.5"],
        ["table2", "Wooden Table Piece", "₹499", "4.7"],
        ["table3", "Festival Table Decor", "₹399", "4.6"],
        ["table4", "Mini Table Showpiece", "₹349", "4.8"],
        ["table5", "Luxury Table Decor", "₹799", "4.9"],
      ],
      "Door Hangings": [
        ["door1", "Traditional Door Hanging", "₹299", "4.7"],
        ["door2", "Beaded Door Hanging", "₹399", "4.6"],
        ["door3", "Festival Toran", "₹499", "4.8"],
        ["door4", "Floral Door Hanging", "₹349", "4.5"],
        ["door5", "Premium Door Toran", "₹699", "4.9"],
      ],
      Showpieces: [
        ["showpiece1", "Clay Handmade Showpiece", "₹399", "4.7"],
        ["showpiece2", "Wooden Showpiece", "₹599", "4.8"],
        ["showpiece3", "Traditional Showpiece", "₹499", "4.6"],
        ["showpiece4", "Decorative Miniature", "₹299", "4.5"],
        ["showpiece5", "Premium Home Showpiece", "₹899", "4.9"],
      ],
    },
  },
  Dresses: {
    title: "Dress Types",
    subtitle: "Choose handmade dress category",
    subcategories: {
      Frocks: [
        ["frock1", "Handmade Cotton Frock", "₹799", "4.7"],
        ["frock2", "Floral Baby Frock", "₹699", "4.5"],
        ["frock3", "Party Wear Frock", "₹999", "4.8"],
        ["frock4", "Printed Handmade Frock", "₹749", "4.6"],
        ["frock5", "Traditional Frock", "₹899", "4.9"],
      ],
      Kurtis: [
        ["kurti1", "Hand Embroidered Kurti", "₹899", "4.8"],
        ["kurti2", "Cotton Handmade Kurti", "₹799", "4.6"],
        ["kurti3", "Mirror Work Kurti", "₹1099", "4.7"],
        ["kurti4", "Printed Daily Wear Kurti", "₹699", "4.4"],
        ["kurti5", "Festive Designer Kurti", "₹1299", "4.9"],
      ],
      Sarees: [
        ["saree1", "Handloom Cotton Saree", "₹1499", "4.8"],
        ["saree2", "Block Print Saree", "₹1299", "4.6"],
        ["saree3", "Traditional Silk Saree", "₹2499", "4.9"],
        ["saree4", "Hand Painted Saree", "₹1899", "4.7"],
        ["saree5", "Linen Handmade Saree", "₹1699", "4.5"],
      ],
      Lehengas: [
        ["lehenga1", "Handmade Festive Lehenga", "₹2499", "4.8"],
        ["lehenga2", "Mirror Work Lehenga", "₹2999", "4.9"],
        ["lehenga3", "Cotton Lehenga Set", "₹1899", "4.5"],
        ["lehenga4", "Kids Handmade Lehenga", "₹1599", "4.6"],
        ["lehenga5", "Designer Bridal Lehenga", "₹3999", "4.9"],
      ],
      Sweaters: [
        ["sweater1", "Hand Knitted Sweater", "₹999", "4.8"],
        ["sweater2", "Woolen Winter Sweater", "₹1199", "4.7"],
        ["sweater3", "Kids Wool Sweater", "₹799", "4.5"],
        ["sweater4", "Crochet Sweater", "₹1399", "4.9"],
        ["sweater5", "Colorful Handmade Sweater", "₹1099", "4.6"],
      ],
    },
  },
  Festive: {
    title: "Festive Types",
    subtitle: "Choose handmade festive products",
    subcategories: {
      "Ganesh Idols": [
        ["ganesh1", "Hand Painted Ganesh Idol", "₹499", "4.8"],
        ["ganesh2", "Clay Ganesh Idol", "₹399", "4.7"],
        ["ganesh3", "Eco Friendly Ganesh Idol", "₹699", "4.9"],
        ["ganesh4", "Decorative Ganesh Idol", "₹899", "4.8"],
        ["ganesh5", "Premium Painted Ganesh Idol", "₹1299", "4.9"],
      ],
      Rakhis: [
        ["rakhi1", "Handmade Thread Rakhi", "₹99", "4.7"],
        ["rakhi2", "Beaded Rakhi", "₹149", "4.8"],
        ["rakhi3", "Kids Cartoon Rakhi", "₹129", "4.6"],
        ["rakhi4", "Designer Rakhi Set", "₹249", "4.9"],
        ["rakhi5", "Premium Rakhi Gift Combo", "₹499", "4.9"],
      ],
      Diyas: [
        ["diya1", "Hand Painted Diya Set", "₹199", "4.7"],
        ["diya2", "Clay Diya Set", "₹149", "4.6"],
        ["diya3", "Decorative Diya", "₹249", "4.8"],
        ["diya4", "Festival Diya Pack", "₹299", "4.5"],
        ["diya5", "Premium Diya Set", "₹499", "4.9"],
      ],
      Rangoli: [
        ["rangoli1", "Handmade Rangoli Plate", "₹299", "4.7"],
        ["rangoli2", "Festival Rangoli Kit", "₹399", "4.8"],
        ["rangoli3", "Decor Rangoli Set", "₹349", "4.6"],
        ["rangoli4", "Colorful Rangoli Pack", "₹249", "4.5"],
        ["rangoli5", "Premium Rangoli Kit", "₹599", "4.9"],
      ],
      "Pooja Items": [
        ["pooja1", "Pooja Thali Set", "₹499", "4.8"],
        ["pooja2", "Decorated Kalash", "₹399", "4.7"],
        ["pooja3", "Handmade Pooja Plate", "₹349", "4.5"],
        ["pooja4", "Festival Pooja Combo", "₹699", "4.9"],
        ["pooja5", "Premium Pooja Set", "₹899", "4.9"],
      ],
      Lanterns: [
        ["lantern1", "Paper Festival Lantern", "₹249", "4.6"],
        ["lantern2", "Decor Hanging Lantern", "₹399", "4.7"],
        ["lantern3", "Handmade Lantern", "₹499", "4.8"],
        ["lantern4", "Colorful Lantern", "₹299", "4.5"],
        ["lantern5", "Premium Festive Lantern", "₹699", "4.9"],
      ],
      "Navratri Decor": [
        ["navratri1", "Handmade Garba Pot", "₹399", "4.7"],
        ["navratri2", "Decorated Dandiya Sticks", "₹299", "4.8"],
        ["navratri3", "Navratri Wall Hanging", "₹499", "4.6"],
        ["navratri4", "Festival Toran Decor", "₹349", "4.7"],
        ["navratri5", "Premium Navratri Decor Set", "₹799", "4.9"],
      ],
      "Christmas Decor": [
        ["christmas1", "Handmade Christmas Ornament", "₹199", "4.7"],
        ["christmas2", "Woolen Christmas Hanging", "₹249", "4.8"],
        ["christmas3", "Mini Christmas Tree Decor", "₹399", "4.6"],
        ["christmas4", "Handmade Santa Decor", "₹299", "4.7"],
        ["christmas5", "Premium Christmas Decor Set", "₹699", "4.9"],
      ],
    },
  },
  Jewelry: {
    title: "Jewelry Types",
    subtitle: "Choose handmade jewelry category",
    subcategories: {
      Earrings: [
        ["earring1", "Handmade Beaded Earrings", "₹199", "4.7"],
        ["earring2", "Terracotta Earrings", "₹249", "4.8"],
        ["earring3", "Silk Thread Earrings", "₹299", "4.6"],
        ["earring4", "Mirror Work Earrings", "₹349", "4.9"],
        ["earring5", "Premium Handmade Earrings", "₹499", "4.9"],
      ],
      Necklaces: [
        ["necklace1", "Beaded Handmade Necklace", "₹399", "4.7"],
        ["necklace2", "Terracotta Necklace", "₹599", "4.8"],
        ["necklace3", "Thread Work Necklace", "₹499", "4.6"],
        ["necklace4", "Festival Necklace Set", "₹799", "4.9"],
        ["necklace5", "Premium Necklace Set", "₹999", "4.9"],
      ],
      Bangles: [
        ["bangle1", "Silk Thread Bangles", "₹299", "4.7"],
        ["bangle2", "Mirror Work Bangles", "₹399", "4.8"],
        ["bangle3", "Beaded Bangle Set", "₹349", "4.6"],
        ["bangle4", "Traditional Bangles", "₹499", "4.9"],
        ["bangle5", "Premium Bangle Set", "₹699", "4.9"],
      ],
      Anklets: [
        ["anklet1", "Handmade Beaded Anklet", "₹199", "4.6"],
        ["anklet2", "Thread Work Anklet", "₹249", "4.7"],
        ["anklet3", "Traditional Anklet", "₹399", "4.8"],
        ["anklet4", "Festival Anklet Pair", "₹499", "4.9"],
        ["anklet5", "Premium Handmade Anklet", "₹599", "4.9"],
      ],
    },
  },
  Paintings: {
    title: "Painting Types",
    subtitle: "Choose handmade painting category",
    subcategories: {
      "Canvas Paintings": [
        ["canvas1", "Handmade Canvas Painting", "₹999", "4.8"],
        ["canvas2", "Nature Canvas Art", "₹1299", "4.7"],
        ["canvas3", "Abstract Canvas Painting", "₹1499", "4.9"],
        ["canvas4", "Floral Canvas Art", "₹1199", "4.6"],
        ["canvas5", "Premium Canvas Painting", "₹1999", "4.9"],
      ],
      "Madhubani Paintings": [
        ["madhubani1", "Traditional Madhubani Art", "₹899", "4.8"],
        ["madhubani2", "Madhubani Wall Painting", "₹1299", "4.9"],
        ["madhubani3", "Handmade Folk Painting", "₹999", "4.7"],
        ["madhubani4", "Colorful Madhubani Art", "₹1199", "4.8"],
        ["madhubani5", "Premium Madhubani Painting", "₹1799", "4.9"],
      ],
      "Warli Paintings": [
        ["warli1", "Traditional Warli Painting", "₹799", "4.7"],
        ["warli2", "Warli Village Art", "₹999", "4.8"],
        ["warli3", "Handmade Warli Frame", "₹1199", "4.6"],
        ["warli4", "Black White Warli Art", "₹899", "4.7"],
        ["warli5", "Premium Warli Painting", "₹1499", "4.9"],
      ],
      "Mini Paintings": [
        ["mini1", "Mini Handmade Painting", "₹299", "4.6"],
        ["mini2", "Mini Canvas Art", "₹399", "4.7"],
        ["mini3", "Mini Floral Painting", "₹449", "4.8"],
        ["mini4", "Mini Decor Painting", "₹499", "4.5"],
        ["mini5", "Premium Mini Painting", "₹699", "4.9"],
      ],
    },
  },
  Pickles: {
    title: "Pickle Types",
    subtitle: "Choose homemade pickle category",
    subcategories: {
      "Mango Pickle": [
        ["mango1", "Homemade Mango Pickle", "₹199", "4.8"],
        ["mango2", "Spicy Mango Pickle", "₹249", "4.7"],
        ["mango3", "Andhra Mango Pickle", "₹299", "4.9"],
        ["mango4", "Traditional Mango Pickle", "₹349", "4.6"],
        ["mango5", "Premium Mango Pickle", "₹499", "4.9"],
      ],
      "Lemon Pickle": [
        ["lemon1", "Homemade Lemon Pickle", "₹179", "4.6"],
        ["lemon2", "Spicy Lemon Pickle", "₹229", "4.7"],
        ["lemon3", "Traditional Lemon Pickle", "₹249", "4.8"],
        ["lemon4", "Sweet Lemon Pickle", "₹299", "4.5"],
        ["lemon5", "Premium Lemon Pickle", "₹399", "4.9"],
      ],
      "Gongura Pickle": [
        ["gongura1", "Homemade Gongura Pickle", "₹249", "4.8"],
        ["gongura2", "Andhra Gongura Pickle", "₹299", "4.9"],
        ["gongura3", "Spicy Gongura Pickle", "₹349", "4.7"],
        ["gongura4", "Traditional Gongura Pickle", "₹399", "4.8"],
        ["gongura5", "Premium Gongura Pickle", "₹499", "4.9"],
      ],
      "Mixed Pickle": [
        ["mixed1", "Homemade Mixed Pickle", "₹199", "4.6"],
        ["mixed2", "Spicy Mixed Pickle", "₹249", "4.7"],
        ["mixed3", "Veg Mixed Pickle", "₹299", "4.8"],
        ["mixed4", "Traditional Mixed Pickle", "₹349", "4.6"],
        ["mixed5", "Premium Mixed Pickle", "₹499", "4.9"],
      ],
    },
  },
  Pottery: {
    title: "Pottery Types",
    subtitle: "Choose handmade pottery category",
    subcategories: {
      "Clay Pots": [
        ["pot1", "Handmade Clay Pot", "₹399", "4.7"],
        ["pot2", "Decor Clay Pot", "₹499", "4.8"],
        ["pot3", "Traditional Clay Pot", "₹599", "4.6"],
        ["pot4", "Painted Clay Pot", "₹699", "4.9"],
        ["pot5", "Premium Clay Pot", "₹899", "4.9"],
      ],
      Vases: [
        ["vase1", "Handmade Ceramic Vase", "₹499", "4.7"],
        ["vase2", "Decor Flower Vase", "₹699", "4.8"],
        ["vase3", "Painted Clay Vase", "₹799", "4.6"],
        ["vase4", "Traditional Vase", "₹899", "4.9"],
        ["vase5", "Premium Pottery Vase", "₹1199", "4.9"],
      ],
      "Clay Cups": [
        ["cup1", "Handmade Clay Cup", "₹199", "4.6"],
        ["cup2", "Kulhad Cup Set", "₹299", "4.7"],
        ["cup3", "Painted Clay Cup", "₹349", "4.8"],
        ["cup4", "Traditional Cup Set", "₹399", "4.6"],
        ["cup5", "Premium Clay Cup Set", "₹599", "4.9"],
      ],
      Planters: [
        ["planter1", "Handmade Clay Planter", "₹399", "4.7"],
        ["planter2", "Decor Garden Planter", "₹499", "4.8"],
        ["planter3", "Painted Plant Pot", "₹599", "4.6"],
        ["planter4", "Mini Clay Planter", "₹299", "4.5"],
        ["planter5", "Premium Clay Planter", "₹899", "4.9"],
      ],
    },
  },
  Sweets: {
    title: "Sweet Types",
    subtitle: "Choose homemade sweet category",
    subcategories: {
      Laddus: [
        ["laddu1", "Homemade Boondi Laddu", "₹299", "4.8"],
        ["laddu2", "Besan Laddu", "₹349", "4.7"],
        ["laddu3", "Dry Fruit Laddu", "₹499", "4.9"],
        ["laddu4", "Rava Laddu", "₹299", "4.6"],
        ["laddu5", "Premium Laddu Box", "₹599", "4.9"],
      ],
      Halwa: [
        ["halwa1", "Carrot Halwa", "₹299", "4.7"],
        ["halwa2", "Badam Halwa", "₹499", "4.9"],
        ["halwa3", "Wheat Halwa", "₹349", "4.6"],
        ["halwa4", "Milk Halwa", "₹399", "4.8"],
        ["halwa5", "Premium Halwa Box", "₹699", "4.9"],
      ],
      "Traditional Sweets": [
        ["traditional1", "Homemade Ariselu", "₹399", "4.8"],
        ["traditional2", "Kajjikayalu Sweet", "₹349", "4.7"],
        ["traditional3", "Pootharekulu", "₹499", "4.9"],
        ["traditional4", "Bobbatlu Sweet", "₹399", "4.8"],
        ["traditional5", "Premium Traditional Box", "₹799", "4.9"],
      ],
      "Dry Fruit Sweets": [
        ["dryfruit1", "Kaju Katli", "₹699", "4.9"],
        ["dryfruit2", "Dry Fruit Roll", "₹799", "4.8"],
        ["dryfruit3", "Badam Barfi", "₹699", "4.7"],
        ["dryfruit4", "Pista Sweet Box", "₹899", "4.9"],
        ["dryfruit5", "Premium Dry Fruit Sweets", "₹1199", "4.9"],
      ],
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeCategoryName = (name) => {
  const lower = String(name || "All").trim().toLowerCase();
  const map = {
    all: "All", bag: "Bags", bags: "Bags",
    candle: "Candles", candles: "Candles",
    card: "Cards", cards: "Cards",
    decor: "Decor", "home decor": "Decor", decoration: "Decor",
    dress: "Dresses", dresses: "Dresses", dresees: "Dresses",
    festive: "Festive", festival: "Festive",
    jewelry: "Jewelry", jewellery: "Jewelry",
    painting: "Paintings", paintings: "Paintings",
    pickle: "Pickles", pickles: "Pickles",
    pottery: "Pottery",
    sweet: "Sweets", sweets: "Sweets",
    art: "Paintings",
  };
  return map[lower] || "All";
};

// // ✅ KEY FIX: Build full images array for a product id (e.g. "tote1" → [tote1,tote2..tote5])
// const buildImages = (id) => {
//   const base = String(id || "").replace(/\d+$/, "");
//   return [1, 2, 3, 4, 5]
//     .map((n) => imageMap[`${base}${n}`])
//     .filter(Boolean);
// };

const buildImages = (id) => {

  const singleImage =
    imageMap[id] || placeholder;

  return [singleImage];

};



const makeProducts = (
  categoryKey,
  subcategoryKey,
  rows
) => {

  return rows.map(
    ([id, name, price, rating], index) => {

      const mainImage =
        imageMap[id] || placeholder;

      return {

        id: `${id}-${index}`,

        originalId: id,

        name,
        price,
        rating,

        category: categoryKey,
        subcategory: subcategoryKey,

        image: mainImage,

        // ONLY ONE IMAGE
        images: [mainImage],

        seller:
          "Bliss Handmade Store",

        sellerName:
          "Bliss Handmade Store",

        size: "Medium",

        material:
          "Premium Handmade Quality",

        color:
          "As shown in image",

        weight:
          "Approx 250g",

        stock:
          "Available",

        delivery:
          "Delivery in 3 - 5 days",

        returnPolicy:
          "7 days replacement available",

        description:
          `${name} is a beautiful handmade ${subcategoryKey} product made with premium quality craftsmanship.`,

        fromSeller: false,
      };
    }
  );
};

// ─── ProductImage ─────────────────────────────────────────────────────────────
const ProductImage = memo(({ source }) => {
  const [imgSrc, setImgSrc] = useState(source || placeholder);

  useEffect(() => {
    setImgSrc(source || placeholder);
  }, [source]);

  // ✅ KEY FIX: local require() gives a number — pass directly, NOT wrapped in {uri}
  const resolved =
    typeof imgSrc === "number"
      ? imgSrc
      : typeof imgSrc === "string"
      ? { uri: imgSrc }
      : imgSrc || placeholder;

  return (
    <Image
      source={resolved}
      defaultSource={placeholder}
      style={styles.productImage}
      resizeMode="cover"
      fadeDuration={0}
      onError={() => setImgSrc(placeholder)}
    />
  );
});

// ─── ProductCard ──────────────────────────────────────────────────────────────
const ProductCard = memo(
  ({ item, onPress, onToggleWishlist, onAddToCart, isWishlisted }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.85}
      onPress={() => onPress(item)}
    >
      <ProductImage source={item.image} />

      {item.fromSeller && (
        <View style={styles.liveTag}>
          <Text style={styles.liveTagText}>Seller Live</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.heartBtn}
        activeOpacity={0.8}
        onPress={() => onToggleWishlist(item)}
      >
        <Ionicons
          name={isWishlisted ? "heart" : "heart-outline"}
          size={20}
          color={isWishlisted ? "#E83E7C" : COLORS.text || "#111827"}
        />
      </TouchableOpacity>

      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.categoryText} numberOfLines={1}>
          {item.subcategory || item.category}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.rating}>{item.rating || "4.8"} ⭐</Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          activeOpacity={0.85}
          onPress={() => onAddToCart(item)}
        >
          <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProductListScreen({ route, navigation }) {
  const { addToCart, toggleWishlist, isInWishlist, customerVisibleProducts = [] } = useShop();

  const rawCategory = route?.params?.category;
  const selectedCategory = normalizeCategoryName(rawCategory);

  const categoryInfo =
    selectedCategory === "All" ? null : CATEGORY_DATA[selectedCategory] || null;

  const subCategoryNames = useMemo(() => {
    if (selectedCategory === "All") return ["All"];
    return ["All", ...Object.keys(categoryInfo?.subcategories || {})];
  }, [selectedCategory, categoryInfo]);

  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setSelectedSubCategory("All");
  }, [selectedCategory]);

  // Seller products filtered
  const sellerProducts = useMemo(() => {
    return customerVisibleProducts
      .filter((item) => {
        const itemCategory = normalizeCategoryName(item.category);
        const itemSubcategory = String(item.subcategory || "").trim();
        const categoryMatch = selectedCategory === "All" || itemCategory === selectedCategory;
        const subcategoryMatch = selectedSubCategory === "All" || itemSubcategory === selectedSubCategory;
        return categoryMatch && subcategoryMatch;
      })
      .map((item) => ({
        ...item,
        category: normalizeCategoryName(item.category),
        subcategory: item.subcategory || "Seller Products",
        image: item.image || placeholder,
        // images: item.images?.length > 0 ? item.images : [item.image || placeholder],
        images: [
  item.image || placeholder,
],
        fromSeller: true,
        rating: item.rating || "4.8",
        seller: item.sellerName || "Seller Hub",
        sellerName: item.sellerName || "Seller Hub",
        stock: item.stock ? `${item.stock} Available` : "Available",
        delivery: item.delivery || "Delivery in 3 - 5 days",
        returnPolicy: item.returnPolicy || "7 days return available",
        description: item.description || `${item.name} is added by seller.`,
      }));
  }, [customerVisibleProducts, selectedCategory, selectedSubCategory]);

  // Static/local products
  const localProducts = useMemo(() => {
    return []; // Removed dummy data per user request
  }, []);

  // const productsToShow = useMemo(
  //   () => [...sellerProducts, ...localProducts],
  //   [sellerProducts, localProducts]
  // );

  const productsToShow = useMemo(() => {

  const combined = [
    ...sellerProducts,
    ...localProducts,
  ];

  const seen = new Set();

  return combined.filter((item) => {

    const uniqueKey =
      item.originalId || item.id;

    if (seen.has(uniqueKey)) {
      return false;
    }

    seen.add(uniqueKey);

    return true;

  });

}, [
  sellerProducts,
  localProducts,
]);

  // ✅ KEY FIX: navigate with the FULL product object including images array
  // // ProductDetailsScreen reads everything from route.params.product
  // const handleProductPress = useCallback(
  //   (product) => {
  //     navigation.navigate("ProductDetails", { product });
  //   },
  //   [navigation]
  // );


  const handleProductPress = useCallback(
  (product) => {

    const safeProduct = {

      ...product,

      image:
        product?.image ||
        placeholder,

      images:
        product?.images?.length > 0
          ? product.images
          : [
              product?.image ||
                placeholder,
            ],

      seller:
        product?.seller ||
        "Bliss Handmade Store",

      sellerName:
        product?.sellerName ||
        "Bliss Handmade Store",

      stock:
        product?.stock ||
        "Available",

      delivery:
        product?.delivery ||
        "Delivery in 3 - 5 days",

      returnPolicy:
        product?.returnPolicy ||
        "7 days replacement available",

      description:
        product?.description ||
        `${product?.name} handmade product`,
    };

    navigation.navigate(
      "ProductDetails",
      {
        product: safeProduct,
      }
    );
  },
  [navigation]
);

  const handleAddToCart = useCallback(
    (product) => {
      addToCart(product);
      setToast(`${product.name} added to cart`);
      setTimeout(() => setToast(""), 1400);
    },
    [addToCart]
  );

  return (
    <View style={styles.container}>
      {/* <Header
        title={selectedCategory === "All" ? "Shop" : selectedCategory}
        navigation={navigation}
        color={COLORS.customer || "#E83E7C"}
      /> */}
      {/* <Header
  title={selectedCategory === "All" ? "Shop" : selectedCategory}
  navigation={navigation}
  color={COLORS.customer || "#E83E7C"}
  rightIcon="notifications-outline" // Ionicons name
  onRightPress={() => navigation.navigate("CustomerNotifications")}
/> */}

<Header
  title={selectedCategory === "All" ? "Shop" : selectedCategory}
  navigation={navigation}
  color={COLORS.customer || "#E83E7C"}
  rightIcon="notifications-outline"
  onRightPress={() => navigation.navigate("CustomerNotifications")}
/>


      {toast ? (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <View style={styles.topBox}>
        <Text style={styles.title}>
          {selectedCategory === "All"
            ? "All Products"
            : categoryInfo?.title || `${selectedCategory} Products`}
        </Text>
        <Text style={styles.subtitle}>
          {selectedCategory === "All"
            ? "Handmade marketplace products"
            : categoryInfo?.subtitle || ""}
        </Text>
      </View>

      <View style={styles.chipOuter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subCategoryScroll}
        >
          {subCategoryNames.map((item) => {
            const active = selectedSubCategory === item;
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                onPress={() => setSelectedSubCategory(item)}
                style={[styles.subCategoryChip, active && styles.activeSubCategoryChip]}
              >
                <Text
                  style={[styles.subCategoryText, active && styles.activeSubCategoryText]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.selectedRow}>
        <Text style={styles.selectedTitle} numberOfLines={1}>
          {selectedSubCategory}
        </Text>
        <Text style={styles.countText}>{productsToShow.length} Items</Text>
      </View>

      <FlatList
        data={productsToShow}
        // keyExtractor={(item) => String(item.id)}
        keyExtractor={(item, index) =>
  `${item.id}-${index}`
}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={handleProductPress}
            onToggleWishlist={toggleWishlist}
            onAddToCart={handleAddToCart}
            isWishlisted={isInWishlist(item.id)}
          />
        )}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.columnWrapper}
        removeClippedSubviews={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        extraData={selectedSubCategory}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Image source={placeholder} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>Products will appear here.</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  toast: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginTop: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: "#F0FDF4", borderRadius: 12,
    borderWidth: 1, borderColor: "#BBF7D0", elevation: 2,
  },
  toastText: { fontSize: 13, fontWeight: "700", color: "#15803D", flex: 1 },

  topBox: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "900", color: COLORS.text || "#111827" },
  subtitle: { marginTop: 4, fontSize: 13, color: COLORS.muted || "#6B7280", fontWeight: "600" },

  chipOuter: { minHeight: 70 },
  subCategoryScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  subCategoryChip: {
    paddingHorizontal: 16, height: 42, borderRadius: 22,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F1E3EA",
    alignItems: "center", justifyContent: "center",
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.08,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  activeSubCategoryChip: { backgroundColor: "#082843", borderColor: "#082843" },
  subCategoryText: { fontSize: 13, fontWeight: "800", color: COLORS.text || "#111827" },
  activeSubCategoryText: { color: "#FFFFFF" },

  selectedRow: {
    paddingHorizontal: 16, marginTop: 4, marginBottom: 10,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  selectedTitle: { flex: 1, fontSize: 19, fontWeight: "900", color: COLORS.text || "#111827" },
  countText: { fontSize: 13, fontWeight: "800", color: "#082843" },

  productList: { paddingHorizontal: 12, paddingBottom: 110 },
  columnWrapper: { justifyContent: "space-between" },

  productCard: {
    width: "48%", backgroundColor: "#FFFFFF", borderRadius: 18, marginBottom: 14,
    overflow: "hidden", borderWidth: 1, borderColor: "#F1E3EA",
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.1,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  productImage: { width: "100%", height: 145, backgroundColor: "#FDE2E9" },

  liveTag: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: "#16A34A", paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 10,
  },
  liveTagText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },

  heartBtn: {
    position: "absolute", right: 8, top: 8,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center", justifyContent: "center",
  },

  productContent: { padding: 10 },
  productName: { fontSize: 14, fontWeight: "900", color: COLORS.text || "#111827", minHeight: 38 },
  categoryText: { fontSize: 11, fontWeight: "700", color: COLORS.muted || "#6B7280", marginTop: 2 },
  priceRow: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 16, fontWeight: "900", color: "#082843" },
  rating: { fontSize: 12, fontWeight: "800", color: COLORS.text || "#111827" },

  cartBtn: {
    marginTop: 10, height: 36, borderRadius: 18,
    backgroundColor: "#082843", flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 6,
  },
  cartBtnText: { fontSize: 12, fontWeight: "900", color: "#FFFFFF" },

  emptyBox: { alignItems: "center", justifyContent: "center", paddingTop: 50, paddingHorizontal: 24 },
  emptyImage: { width: 120, height: 120, opacity: 0.7 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "900", color: COLORS.text || "#111827" },
  emptyText: { marginTop: 6, fontSize: 13, fontWeight: "600", color: COLORS.muted || "#6B7280", textAlign: "center" },
});