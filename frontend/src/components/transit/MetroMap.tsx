import { useState, useRef, useCallback, useEffect } from "react";
import type { RouteResponse } from "@/lib/transit-api";

// ── Official DMRC Line Colors ─────────────────────────────────────────────────
const LC: Record<string, string> = {
  red:"#e53935", yellow:"#f9a825", blue:"#1565c0", blueB:"#42a5f5",
  green:"#2e7d32", greenB:"#66bb6a", violet:"#6a1b9a", pink:"#c2185b",
  magenta:"#7b1fa2", orange:"#e65100", gray:"#757575", aqua:"#00838f", rapid:"#37474f",
};

const LL: Record<string, string> = {
  red:"Red Line", yellow:"Yellow Line", blue:"Blue Line", blueB:"Blue Line Branch",
  green:"Green Line", greenB:"Green Line Branch", violet:"Violet Line", pink:"Pink Line",
  magenta:"Magenta Line", orange:"Orange Line", gray:"Gray Line", aqua:"Aqua Line", rapid:"Rapid Metro",
};

type Anchor = "start"|"middle"|"end";
type St = {
  x:number; y:number; lines:string[]; ic?:boolean;
  lx?:number; ly?:number; anchor?:Anchor;
};

// ── Station data — large canvas (3000×2600) for proper spacing ────────────────
const ST: Record<string,St> = {
  // ══ YELLOW LINE — vertical spine x=1400 ══════════════════════════════════
  "Samaypur Badli":        {x:1400,y:60,  lines:["yellow"], lx:1415,ly:64,  anchor:"start"},
  "Rohini Sec 18,19":      {x:1400,y:120, lines:["yellow"], lx:1415,ly:124, anchor:"start"},
  "Haiderpur Badli Mor":   {x:1400,y:180, lines:["yellow"], lx:1415,ly:184, anchor:"start"},
  "Jahangirpuri":          {x:1400,y:240, lines:["yellow"], lx:1415,ly:244, anchor:"start"},
  "Adarsh Nagar":          {x:1400,y:300, lines:["yellow"], lx:1415,ly:304, anchor:"start"},
  "Azadpur":               {x:1400,y:360, lines:["yellow","pink"],ic:true,  lx:1380,ly:354, anchor:"end"},
  "Model Town":            {x:1400,y:420, lines:["yellow"], lx:1415,ly:424, anchor:"start"},
  "GTB Nagar":             {x:1400,y:480, lines:["yellow"], lx:1415,ly:484, anchor:"start"},
  "Vishwavidyalaya":       {x:1400,y:540, lines:["yellow"], lx:1415,ly:544, anchor:"start"},
  "Vidhan Sabha":          {x:1400,y:600, lines:["yellow"], lx:1415,ly:604, anchor:"start"},
  "Civil Lines":           {x:1400,y:660, lines:["yellow"], lx:1415,ly:664, anchor:"start"},
  "Kashmere Gate":         {x:1400,y:720, lines:["yellow","red","violet"],ic:true, lx:1380,ly:714, anchor:"end"},
  "Chandni Chowk":         {x:1400,y:780, lines:["yellow"], lx:1415,ly:784, anchor:"start"},
  "Chawri Bazar":          {x:1400,y:840, lines:["yellow"], lx:1415,ly:844, anchor:"start"},
  "New Delhi":             {x:1400,y:900, lines:["yellow","orange"],ic:true, lx:1380,ly:894, anchor:"end"},
  "Rajiv Chowk":           {x:1400,y:960, lines:["yellow","blue"],ic:true,  lx:1380,ly:954, anchor:"end"},
  "Patel Chowk":           {x:1400,y:1020,lines:["yellow"], lx:1415,ly:1024,anchor:"start"},
  "Central Secretariat":   {x:1400,y:1080,lines:["yellow","violet"],ic:true, lx:1380,ly:1074,anchor:"end"},
  "Udyog Bhawan":          {x:1400,y:1140,lines:["yellow"], lx:1415,ly:1144,anchor:"start"},
  "Lok Kalyan Marg":       {x:1400,y:1200,lines:["yellow"], lx:1415,ly:1204,anchor:"start"},
  "Jor Bagh":              {x:1400,y:1260,lines:["yellow"], lx:1415,ly:1264,anchor:"start"},
  "INA":                   {x:1400,y:1320,lines:["yellow","pink"],ic:true,  lx:1380,ly:1314,anchor:"end"},
  "AIIMS":                 {x:1400,y:1380,lines:["yellow"], lx:1415,ly:1384,anchor:"start"},
  "Green Park":            {x:1400,y:1440,lines:["yellow"], lx:1415,ly:1444,anchor:"start"},
  "Hauz Khas":             {x:1400,y:1500,lines:["yellow","magenta"],ic:true, lx:1380,ly:1494,anchor:"end"},
  "Malviya Nagar":         {x:1400,y:1560,lines:["yellow"], lx:1415,ly:1564,anchor:"start"},
  "Saket":                 {x:1400,y:1620,lines:["yellow"], lx:1415,ly:1624,anchor:"start"},
  "Qutab Minar":           {x:1400,y:1680,lines:["yellow"], lx:1415,ly:1684,anchor:"start"},
  "Chhattarpur":           {x:1400,y:1740,lines:["yellow"], lx:1415,ly:1744,anchor:"start"},
  "Sultanpur":             {x:1400,y:1800,lines:["yellow"], lx:1415,ly:1804,anchor:"start"},
  "Ghitorni":              {x:1400,y:1860,lines:["yellow"], lx:1415,ly:1864,anchor:"start"},
  "Arjan Garh":            {x:1400,y:1920,lines:["yellow"], lx:1415,ly:1924,anchor:"start"},
  "Guru Dronacharya":      {x:1400,y:1980,lines:["yellow"], lx:1415,ly:1984,anchor:"start"},
  "Sikandarpur":           {x:1400,y:2040,lines:["yellow","rapid"],ic:true, lx:1380,ly:2034,anchor:"end"},
  "MG Road":               {x:1400,y:2100,lines:["yellow"], lx:1415,ly:2104,anchor:"start"},
  "IFFCO Chowk":           {x:1400,y:2160,lines:["yellow"], lx:1415,ly:2164,anchor:"start"},
  "Huda City Centre":      {x:1400,y:2220,lines:["yellow"], lx:1415,ly:2224,anchor:"start"},

  // ══ RED LINE — horizontal top, then NE diagonal ══════════════════════════
  "Rithala":               {x:200, y:480, lines:["red"],  lx:200, ly:465, anchor:"middle"},
  "Rohini West":           {x:280, y:480, lines:["red"],  lx:280, ly:465, anchor:"middle"},
  "Rohini East":           {x:360, y:480, lines:["red"],  lx:360, ly:465, anchor:"middle"},
  "Pitam Pura":            {x:440, y:480, lines:["red"],  lx:440, ly:465, anchor:"middle"},
  "Kohat Enclave":         {x:520, y:480, lines:["red"],  lx:520, ly:465, anchor:"middle"},
  "Netaji Subash Place":   {x:600, y:480, lines:["red","pink"],ic:true, lx:600,ly:465,anchor:"middle"},
  "Keshav Puram":          {x:680, y:480, lines:["red"],  lx:680, ly:465, anchor:"middle"},
  "Kanhaiya Nagar":        {x:760, y:480, lines:["red"],  lx:760, ly:465, anchor:"middle"},
  "Inderlok":              {x:840, y:480, lines:["red","green"],ic:true, lx:840,ly:465,anchor:"middle"},
  "Shastri Nagar":         {x:920, y:480, lines:["red"],  lx:920, ly:465, anchor:"middle"},
  "Pratap Nagar":          {x:1000,y:480, lines:["red"],  lx:1000,ly:465, anchor:"middle"},
  "Pul Bangash":           {x:1080,y:480, lines:["red"],  lx:1080,ly:465, anchor:"middle"},
  "Tis Hazari":            {x:1160,y:480, lines:["red"],  lx:1160,ly:465, anchor:"middle"},
  // Kashmere Gate at (1400,720) — red goes diag NE from here
  "Shastri Park":          {x:1480,y:660, lines:["red"],  lx:1496,ly:660, anchor:"start"},
  "Seelampur":             {x:1560,y:600, lines:["red"],  lx:1576,ly:600, anchor:"start"},
  "Welcome":               {x:1640,y:540, lines:["red","pink"],ic:true, lx:1656,ly:534,anchor:"start"},
  "Shahdara":              {x:1720,y:480, lines:["red"],  lx:1736,ly:480, anchor:"start"},
  "Mansarovar Park":       {x:1800,y:420, lines:["red"],  lx:1816,ly:420, anchor:"start"},
  "Jhil Mil":              {x:1880,y:360, lines:["red"],  lx:1896,ly:360, anchor:"start"},
  "Dilshad Garden":        {x:1960,y:300, lines:["red"],  lx:1976,ly:300, anchor:"start"},
  "Shaheed Nagar":         {x:2040,y:240, lines:["red"],  lx:2056,ly:240, anchor:"start"},
  "Raj Bagh":              {x:2120,y:180, lines:["red"],  lx:2136,ly:180, anchor:"start"},
  "Major Mohit Sharma":    {x:2200,y:120, lines:["red"],  lx:2216,ly:120, anchor:"start"},
  "Shyam Park":            {x:2280,y:120, lines:["red"],  lx:2296,ly:120, anchor:"start"},
  "Mohan Nagar":           {x:2360,y:120, lines:["red"],  lx:2376,ly:120, anchor:"start"},
  "Arthala":               {x:2440,y:120, lines:["red"],  lx:2456,ly:120, anchor:"start"},
  "Hindon River":          {x:2520,y:120, lines:["red"],  lx:2536,ly:120, anchor:"start"},
  "Shaheed Sthal":         {x:2600,y:120, lines:["red"],  lx:2616,ly:120, anchor:"start"},

  // ══ BLUE LINE — horizontal middle y=960 ══════════════════════════════════
  "Dwarka Sec 21":         {x:200, y:960, lines:["blue","orange"],ic:true, lx:200,ly:980,anchor:"middle"},
  "Dwarka Sec 8":          {x:300, y:960, lines:["blue"], lx:300, ly:978, anchor:"middle"},
  "Dwarka Sec 9":          {x:400, y:960, lines:["blue"], lx:400, ly:978, anchor:"middle"},
  "Dwarka Sec 10":         {x:500, y:960, lines:["blue"], lx:500, ly:978, anchor:"middle"},
  "Dwarka Sec 11":         {x:600, y:960, lines:["blue"], lx:600, ly:978, anchor:"middle"},
  "Dwarka Sec 12":         {x:700, y:960, lines:["blue"], lx:700, ly:978, anchor:"middle"},
  "Dwarka Sec 13":         {x:800, y:960, lines:["blue"], lx:800, ly:978, anchor:"middle"},
  "Dwarka Sec 14":         {x:900, y:960, lines:["blue"], lx:900, ly:978, anchor:"middle"},
  "Dwarka":                {x:950, y:960, lines:["blue","gray"],ic:true, lx:950,ly:978,anchor:"middle"},
  "Dwarka Mor":            {x:1000,y:960, lines:["blue"], lx:1000,ly:978, anchor:"middle"},
  "Nawada":                {x:1060,y:960, lines:["blue"], lx:1060,ly:978, anchor:"middle"},
  "Uttam Nagar West":      {x:1120,y:960, lines:["blue"], lx:1120,ly:978, anchor:"middle"},
  "Uttam Nagar East":      {x:1180,y:960, lines:["blue"], lx:1180,ly:978, anchor:"middle"},
  "Janakpuri West":        {x:1240,y:960, lines:["blue","magenta"],ic:true, lx:1240,ly:980,anchor:"middle"},
  "Janakpuri East":        {x:1290,y:960, lines:["blue"], lx:1290,ly:978, anchor:"middle"},
  "Tilak Nagar":           {x:1310,y:960, lines:["blue"], lx:1310,ly:978, anchor:"middle"},
  "Subhash Nagar":         {x:1326,y:960, lines:["blue"], lx:1326,ly:978, anchor:"middle"},
  "Tagore Garden":         {x:1342,y:960, lines:["blue"], lx:1342,ly:978, anchor:"middle"},
  "Rajouri Garden":        {x:1356,y:960, lines:["blue","pink"],ic:true, lx:1356,ly:942,anchor:"middle"},
  "Ramesh Nagar":          {x:1366,y:960, lines:["blue"], lx:1366,ly:978, anchor:"middle"},
  "Moti Nagar":            {x:1374,y:960, lines:["blue"], lx:1374,ly:978, anchor:"middle"},
  "Kirti Nagar":           {x:1384,y:930, lines:["blue","greenB"],ic:true, lx:1365,ly:924,anchor:"end"},
  "Shadipur":              {x:1386,y:960, lines:["blue"], lx:1386,ly:978, anchor:"middle"},
  "Patel Nagar":           {x:1390,y:960, lines:["blue"], lx:1390,ly:978, anchor:"middle"},
  "Rajendra Place":        {x:1393,y:960, lines:["blue"], lx:1393,ly:978, anchor:"middle"},
  "Karol Bagh":            {x:1396,y:960, lines:["blue"], lx:1396,ly:978, anchor:"middle"},
  "Jhandewalan":           {x:1398,y:960, lines:["blue"], lx:1398,ly:978, anchor:"middle"},
  "RK Ashram Marg":        {x:1399,y:960, lines:["blue"], lx:1399,ly:978, anchor:"middle"},
  // Rajiv Chowk at (1400,960)
  "Barakhamba Road":       {x:1460,y:960, lines:["blue"], lx:1460,ly:978, anchor:"middle"},
  "Mandi House":           {x:1520,y:960, lines:["blue","violet"],ic:true, lx:1520,ly:942,anchor:"middle"},
  "Pragati Maidan":        {x:1580,y:960, lines:["blue"], lx:1580,ly:978, anchor:"middle"},
  "Indraprastha":          {x:1640,y:960, lines:["blue"], lx:1640,ly:978, anchor:"middle"},
  "Yamuna Bank":           {x:1700,y:960, lines:["blue","blueB"],ic:true, lx:1700,ly:980,anchor:"middle"},
  "Akshardham":            {x:1760,y:960, lines:["blue"], lx:1760,ly:978, anchor:"middle"},
  "Mayur Vihar-1":         {x:1820,y:960, lines:["blue","pink"],ic:true, lx:1820,ly:980,anchor:"middle"},
  "Mayur Vihar Ext":       {x:1880,y:960, lines:["blue"], lx:1880,ly:978, anchor:"middle"},
  "New Ashok Nagar":       {x:1940,y:960, lines:["blue"], lx:1940,ly:978, anchor:"middle"},
  "Noida Sec 15":          {x:2000,y:960, lines:["blue"], lx:2000,ly:978, anchor:"middle"},
  "Noida Sec 16":          {x:2060,y:960, lines:["blue"], lx:2060,ly:978, anchor:"middle"},
  "Noida Sec 18":          {x:2120,y:960, lines:["blue"], lx:2120,ly:978, anchor:"middle"},
  "Botanical Garden":      {x:2180,y:960, lines:["blue","magenta"],ic:true, lx:2180,ly:942,anchor:"middle"},
  "Golf Course":           {x:2240,y:960, lines:["blue"], lx:2240,ly:978, anchor:"middle"},
  "Noida City Centre":     {x:2300,y:960, lines:["blue"], lx:2300,ly:978, anchor:"middle"},
  "Noida Sec 34":          {x:2360,y:960, lines:["blue"], lx:2360,ly:978, anchor:"middle"},
  "Noida Sec 52":          {x:2360,y:900, lines:["blue","aqua"],ic:true, lx:2376,ly:900,anchor:"start"},
  "Noida Sec 61":          {x:2360,y:840, lines:["blue"], lx:2376,ly:840, anchor:"start"},
  "Noida Sec 59":          {x:2360,y:780, lines:["blue"], lx:2376,ly:780, anchor:"start"},
  "Noida Sec 62":          {x:2360,y:720, lines:["blue"], lx:2376,ly:720, anchor:"start"},
  "Noida Electronic City": {x:2360,y:660, lines:["blue"], lx:2376,ly:660, anchor:"start"},

  // ══ BLUE BRANCH — from Yamuna Bank diagonal NE ═══════════════════════════
  "Laxmi Nagar":           {x:1760,y:900, lines:["blueB"], lx:1776,ly:900, anchor:"start"},
  "Nirman Vihar":          {x:1820,y:840, lines:["blueB"], lx:1836,ly:840, anchor:"start"},
  "Preet Vihar":           {x:1880,y:780, lines:["blueB"], lx:1896,ly:780, anchor:"start"},
  "Karkarduma":            {x:1940,y:720, lines:["blueB","pink"],ic:true, lx:1956,ly:714,anchor:"start"},
  "Karkarduma Court":      {x:1980,y:660, lines:["blueB"], lx:1996,ly:660, anchor:"start"},
  "Anand Vihar":           {x:2020,y:600, lines:["blueB","pink"],ic:true, lx:2036,ly:594,anchor:"start"},
  "Kaushambi":             {x:2080,y:540, lines:["blueB"], lx:2096,ly:540, anchor:"start"},
  "Vaishali":              {x:2140,y:480, lines:["blueB"], lx:2156,ly:480, anchor:"start"},

  // ══ VIOLET LINE — from Kashmere Gate diagonal SE ═════════════════════════
  "Lal Quila":             {x:1460,y:780, lines:["violet"], lx:1476,ly:780, anchor:"start"},
  "Jama Masjid":           {x:1480,y:840, lines:["violet"], lx:1496,ly:840, anchor:"start"},
  "Delhi Gate":            {x:1490,y:900, lines:["violet"], lx:1506,ly:900, anchor:"start"},
  "ITO":                   {x:1500,y:960, lines:["violet"], lx:1516,ly:960, anchor:"start"},
  // Mandi House shared (1520,960)
  "Janpath":               {x:1480,y:1020,lines:["violet"], lx:1462,ly:1020,anchor:"end"},
  // Central Secretariat shared (1400,1080)
  "Khan Market":           {x:1460,y:1140,lines:["violet"], lx:1476,ly:1140,anchor:"start"},
  "JLN Stadium":           {x:1520,y:1200,lines:["violet"], lx:1536,ly:1200,anchor:"start"},
  "Jangpura":              {x:1560,y:1260,lines:["violet"], lx:1576,ly:1260,anchor:"start"},
  "Lajpat Nagar":          {x:1600,y:1320,lines:["violet","pink"],ic:true, lx:1616,ly:1314,anchor:"start"},
  "Moolchand":             {x:1640,y:1380,lines:["violet"], lx:1656,ly:1380,anchor:"start"},
  "Kailash Colony":        {x:1680,y:1440,lines:["violet"], lx:1696,ly:1440,anchor:"start"},
  "Nehru Place":           {x:1720,y:1500,lines:["violet"], lx:1736,ly:1500,anchor:"start"},
  "Kalkaji Mandir":        {x:1760,y:1560,lines:["violet","magenta"],ic:true, lx:1776,ly:1554,anchor:"start"},
  "Govind Puri":           {x:1800,y:1620,lines:["violet"], lx:1816,ly:1620,anchor:"start"},
  "Okhla":                 {x:1840,y:1680,lines:["violet"], lx:1856,ly:1680,anchor:"start"},
  "Jasola Apollo":         {x:1880,y:1740,lines:["violet"], lx:1896,ly:1740,anchor:"start"},
  "Sarita Vihar":          {x:1920,y:1800,lines:["violet"], lx:1936,ly:1800,anchor:"start"},
  "Mohan Estate":          {x:1960,y:1860,lines:["violet"], lx:1976,ly:1860,anchor:"start"},
  "Tughlakabad":           {x:2000,y:1920,lines:["violet"], lx:2016,ly:1920,anchor:"start"},
  "Badarpur":              {x:2040,y:1980,lines:["violet"], lx:2056,ly:1980,anchor:"start"},
  "Sarai":                 {x:2040,y:2040,lines:["violet"], lx:2056,ly:2040,anchor:"start"},
  "NHPC Chowk":            {x:2040,y:2100,lines:["violet"], lx:2056,ly:2100,anchor:"start"},
  "Mewala Maharajpur":     {x:2040,y:2160,lines:["violet"], lx:2056,ly:2160,anchor:"start"},
  "Sec 28 Faridabad":      {x:2040,y:2220,lines:["violet"], lx:2056,ly:2220,anchor:"start"},
  "Badkal Mor":            {x:2080,y:2280,lines:["violet"], lx:2096,ly:2280,anchor:"start"},
  "Old Faridabad":         {x:2120,y:2340,lines:["violet"], lx:2136,ly:2340,anchor:"start"},
  "Neelam Chowk Ajronda":  {x:2160,y:2400,lines:["violet"], lx:2176,ly:2400,anchor:"start"},
  "Bata Chowk":            {x:2200,y:2460,lines:["violet"], lx:2216,ly:2460,anchor:"start"},
  "Escorts Mujesar":       {x:2240,y:2520,lines:["violet"], lx:2256,ly:2520,anchor:"start"},
  "Raja Nahar Singh":      {x:2280,y:2580,lines:["violet"], lx:2296,ly:2580,anchor:"start"},

  // ══ PINK LINE — ring ═════════════════════════════════════════════════════
  "Majlis Park":           {x:1060,y:240, lines:["pink"],  lx:1044,ly:240, anchor:"end"},
  // Azadpur shared (1400,360)
  "Shalimar Bagh":         {x:1160,y:360, lines:["pink"],  lx:1144,ly:360, anchor:"end"},
  // NSP shared (600,480)
  "Shakurpur":             {x:660, y:600, lines:["pink"],  lx:644, ly:600, anchor:"end"},
  "Punjabi Bagh West":     {x:760, y:720, lines:["pink"],  lx:744, ly:720, anchor:"end"},
  "ESI Basai Darapur":     {x:940, y:840, lines:["pink"],  lx:924, ly:840, anchor:"end"},
  // Rajouri Garden shared (1356,960)
  "Maya Puri":             {x:1160,y:1080,lines:["pink"],  lx:1144,ly:1080,anchor:"end"},
  "Naraina Vihar":         {x:1100,y:1140,lines:["pink"],  lx:1084,ly:1140,anchor:"end"},
  "Delhi Cantt":           {x:1060,y:1200,lines:["pink"],  lx:1044,ly:1200,anchor:"end"},
  "Durgabai Deshmukh":     {x:1020,y:1260,lines:["pink"],  lx:1004,ly:1260,anchor:"end"},
  "Sir VM Moti Bagh":      {x:1060,y:1320,lines:["pink"],  lx:1044,ly:1320,anchor:"end"},
  "Bhikaji Cama Place":    {x:1100,y:1380,lines:["pink"],  lx:1084,ly:1380,anchor:"end"},
  "Sarojini Nagar":        {x:1160,y:1440,lines:["pink"],  lx:1144,ly:1440,anchor:"end"},
  // INA shared (1400,1320)
  "South Extension":       {x:1480,y:1380,lines:["pink"],  lx:1496,ly:1380,anchor:"start"},
  // Lajpat Nagar shared (1600,1320)
  "Vinobapuri":            {x:1680,y:1260,lines:["pink"],  lx:1696,ly:1260,anchor:"start"},
  "Ashram":                {x:1720,y:1200,lines:["pink"],  lx:1736,ly:1200,anchor:"start"},
  "Sarai Kale Khan":       {x:1760,y:1140,lines:["pink"],  lx:1776,ly:1140,anchor:"start"},
  // Mayur Vihar-1 shared (1820,960)
  "Mayur Vihar Pocket 1":  {x:1880,y:900, lines:["pink"],  lx:1896,ly:900, anchor:"start"},
  "Trilokpuri":            {x:1940,y:840, lines:["pink"],  lx:1956,ly:840, anchor:"start"},
  "Vinod Nagar East":      {x:2000,y:780, lines:["pink"],  lx:2016,ly:780, anchor:"start"},
  "Mandawali":             {x:2040,y:720, lines:["pink"],  lx:2056,ly:720, anchor:"start"},
  "IP Extension":          {x:2060,y:660, lines:["pink"],  lx:2076,ly:660, anchor:"start"},
  // Anand Vihar shared (2020,600)
  // Karkarduma shared (1940,720)
  "Krishna Nagar":         {x:2000,y:600, lines:["pink"],  lx:2016,ly:600, anchor:"start"},
  "East Azad Nagar":       {x:1880,y:540, lines:["pink"],  lx:1896,ly:540, anchor:"start"},
  // Welcome shared (1640,540)
  "Jaffrabad":             {x:1560,y:480, lines:["pink"],  lx:1576,ly:480, anchor:"start"},
  "Maujpur":               {x:1480,y:420, lines:["pink"],  lx:1496,ly:420, anchor:"start"},
  "Gokulpuri":             {x:1440,y:360, lines:["pink"],  lx:1456,ly:360, anchor:"start"},
  "Johri Enclave":         {x:1420,y:300, lines:["pink"],  lx:1436,ly:300, anchor:"start"},
  "Shiv Vihar":            {x:1420,y:240, lines:["pink"],  lx:1436,ly:240, anchor:"start"},

  // ══ MAGENTA LINE ═════════════════════════════════════════════════════════
  // Janakpuri West shared (1240,960)
  "Dabri Mor":             {x:1160,y:1080,lines:["magenta"],lx:1144,ly:1092,anchor:"end"},
  "Dashrath Puri":         {x:1100,y:1140,lines:["magenta"],lx:1084,ly:1152,anchor:"end"},
  "Palam":                 {x:1040,y:1200,lines:["magenta"],lx:1024,ly:1212,anchor:"end"},
  "Sadar Bazar Cantonment":{x:980, y:1260,lines:["magenta"],lx:964, ly:1272,anchor:"end"},
  "Terminal 1 IGI":        {x:920, y:1320,lines:["magenta"],lx:904, ly:1332,anchor:"end"},
  "Shankar Vihar":         {x:960, y:1380,lines:["magenta"],lx:944, ly:1392,anchor:"end"},
  "Vasant Vihar":          {x:1040,y:1500,lines:["magenta"],lx:1024,ly:1512,anchor:"end"},
  "Munirka":               {x:1160,y:1620,lines:["magenta"],lx:1144,ly:1632,anchor:"end"},
  "RK Puram":              {x:1240,y:1620,lines:["magenta"],lx:1224,ly:1632,anchor:"end"},
  "IIT Delhi":             {x:1320,y:1620,lines:["magenta"],lx:1304,ly:1632,anchor:"end"},
  // Hauz Khas shared (1400,1500)
  "Panchsheel Park":       {x:1480,y:1560,lines:["magenta"],lx:1496,ly:1572,anchor:"start"},
  "Chirag Delhi":          {x:1560,y:1620,lines:["magenta"],lx:1576,ly:1632,anchor:"start"},
  "Greater Kailash":       {x:1620,y:1680,lines:["magenta"],lx:1636,ly:1692,anchor:"start"},
  "Nehru Enclave":         {x:1680,y:1680,lines:["magenta"],lx:1696,ly:1692,anchor:"start"},
  // Kalkaji Mandir shared (1760,1560)
  "Okhla NSIC":            {x:1840,y:1560,lines:["magenta"],lx:1856,ly:1572,anchor:"start"},
  "Sukhdev Vihar":         {x:1920,y:1500,lines:["magenta"],lx:1936,ly:1512,anchor:"start"},
  "Jamia Millia Islamia":  {x:2000,y:1440,lines:["magenta"],lx:2016,ly:1452,anchor:"start"},
  "Okhla Vihar":           {x:2080,y:1380,lines:["magenta"],lx:2096,ly:1392,anchor:"start"},
  "Jasola Vihar SB":       {x:2140,y:1320,lines:["magenta"],lx:2156,ly:1332,anchor:"start"},
  "Kalindi Kunj":          {x:2200,y:1260,lines:["magenta"],lx:2216,ly:1272,anchor:"start"},
  "Okhla Bird Sanctuary":  {x:2260,y:1140,lines:["magenta"],lx:2276,ly:1152,anchor:"start"},
  // Botanical Garden shared (2180,960)

  // ══ GREEN LINE ═══════════════════════════════════════════════════════════
  // Inderlok shared (840,480)
  "Ashok Park Main":       {x:780, y:420, lines:["green","greenB"],ic:true, lx:764,ly:420,anchor:"end"},
  "Punjabi Bagh":          {x:720, y:360, lines:["green"], lx:704, ly:360, anchor:"end"},
  "Shivaji Park":          {x:660, y:300, lines:["green"], lx:644, ly:300, anchor:"end"},
  "Madipur":               {x:600, y:240, lines:["green"], lx:584, ly:240, anchor:"end"},
  "Paschim Vihar East":    {x:540, y:180, lines:["green"], lx:524, ly:180, anchor:"end"},
  "Paschim Vihar West":    {x:480, y:120, lines:["green"], lx:464, ly:120, anchor:"end"},
  "Peera Garhi":           {x:420, y:120, lines:["green"], lx:404, ly:120, anchor:"end"},
  "Udyog Nagar":           {x:360, y:120, lines:["green"], lx:344, ly:120, anchor:"end"},
  "Maharaja Surajmal":     {x:300, y:120, lines:["green"], lx:284, ly:120, anchor:"end"},
  "Nangloi":               {x:240, y:120, lines:["green"], lx:224, ly:120, anchor:"end"},
  "Nangloi Railway Stn":   {x:180, y:120, lines:["green"], lx:164, ly:120, anchor:"end"},
  "Rajdhani Park":         {x:120, y:120, lines:["green"], lx:104, ly:120, anchor:"end"},
  "Mundka":                {x:60,  y:120, lines:["green"], lx:44,  ly:120, anchor:"end"},
  "Mundka Industrial":     {x:60,  y:180, lines:["green"], lx:44,  ly:180, anchor:"end"},
  "Ghevra":                {x:60,  y:240, lines:["green"], lx:44,  ly:240, anchor:"end"},
  "Tikri Kalan":           {x:60,  y:300, lines:["green"], lx:44,  ly:300, anchor:"end"},
  "Tikri Border":          {x:60,  y:360, lines:["green"], lx:44,  ly:360, anchor:"end"},
  "Pandit Shree Ram":      {x:60,  y:420, lines:["green"], lx:44,  ly:420, anchor:"end"},
  "Bahadurgarh City":      {x:60,  y:480, lines:["green"], lx:44,  ly:480, anchor:"end"},
  "Brigadier Hoshiyar":    {x:60,  y:540, lines:["green"], lx:44,  ly:540, anchor:"end"},

  // ══ GREEN BRANCH ═════════════════════════════════════════════════════════
  // Ashok Park Main shared (780,420)
  "Satguru Ram Singh":     {x:840, y:360, lines:["greenB"],lx:856, ly:360, anchor:"start"},
  // Kirti Nagar shared (1384,930)

  // ══ ORANGE LINE (Airport Express — dashed) ═══════════════════════════════
  // New Delhi shared (1400,900)
  "Shivaji Stadium":       {x:1320,y:900, lines:["orange"],lx:1304,ly:900,anchor:"end"},
  "Dhaula Kuan":           {x:1120,y:1080,lines:["orange"],lx:1104,ly:1080,anchor:"end"},
  "Delhi Aerocity":        {x:920, y:1200,lines:["orange"],lx:904, ly:1200,anchor:"end"},
  "IGI Airport T3":        {x:760, y:1320,lines:["orange"],lx:744, ly:1320,anchor:"end"},
  // Dwarka Sec 21 shared (200,960)

  // ══ GRAY LINE ════════════════════════════════════════════════════════════
  // ══ GRAY LINE — branches SW from Dwarka ═════════════════════════════════
  "Nangli":                {x:880, y:1040,lines:["gray"],  lx:864, ly:1040,anchor:"end"},
  "Najafgarh":             {x:800, y:1120,lines:["gray"],  lx:784, ly:1120,anchor:"end"},
  "Dhana Bus Stand":       {x:720, y:1200,lines:["gray"],  lx:704, ly:1200,anchor:"end"},

  // ══ AQUA LINE ════════════════════════════════════════════════════════════
  // Noida Sec 52 shared (2360,900)
  "Noida Sec 51":          {x:2440,y:900, lines:["aqua"],  lx:2456,ly:900, anchor:"start"},
  "Noida Sec 50":          {x:2440,y:840, lines:["aqua"],  lx:2456,ly:840, anchor:"start"},
  "Noida Sec 76":          {x:2440,y:780, lines:["aqua"],  lx:2456,ly:780, anchor:"start"},
  "Noida Sec 101":         {x:2440,y:720, lines:["aqua"],  lx:2456,ly:720, anchor:"start"},
  "Noida Sec 81":          {x:2440,y:660, lines:["aqua"],  lx:2456,ly:660, anchor:"start"},
  "NSEZ":                  {x:2440,y:600, lines:["aqua"],  lx:2456,ly:600, anchor:"start"},
  "Noida Sec 83":          {x:2440,y:540, lines:["aqua"],  lx:2456,ly:540, anchor:"start"},
  "Noida Sec 137":         {x:2440,y:480, lines:["aqua"],  lx:2456,ly:480, anchor:"start"},
  "Noida Sec 142":         {x:2440,y:420, lines:["aqua"],  lx:2456,ly:420, anchor:"start"},
  "Noida Sec 143":         {x:2440,y:360, lines:["aqua"],  lx:2456,ly:360, anchor:"start"},
  "Noida Sec 144":         {x:2440,y:300, lines:["aqua"],  lx:2456,ly:300, anchor:"start"},
  "Noida Sec 145":         {x:2440,y:240, lines:["aqua"],  lx:2456,ly:240, anchor:"start"},
  "Noida Sec 146":         {x:2440,y:180, lines:["aqua"],  lx:2456,ly:180, anchor:"start"},
  "Noida Sec 147":         {x:2500,y:180, lines:["aqua"],  lx:2516,ly:180, anchor:"start"},
  "Noida Sec 148":         {x:2560,y:180, lines:["aqua"],  lx:2576,ly:180, anchor:"start"},
  "Knowledge Park 2":      {x:2620,y:180, lines:["aqua"],  lx:2636,ly:180, anchor:"start"},
  "Pari Chowk":            {x:2680,y:180, lines:["aqua"],  lx:2696,ly:180, anchor:"start"},
  "Alpha 1":               {x:2740,y:180, lines:["aqua"],  lx:2756,ly:180, anchor:"start"},
  "Delta 1":               {x:2800,y:180, lines:["aqua"],  lx:2816,ly:180, anchor:"start"},
  "GNIDA Office":          {x:2860,y:180, lines:["aqua"],  lx:2876,ly:180, anchor:"start"},
  "Depot Greater Noida":   {x:2920,y:180, lines:["aqua"],  lx:2936,ly:180, anchor:"start"},

  // ══ RAPID METRO ══════════════════════════════════════════════════════════
  // Sikandarpur shared (1400,2040)
  "Sec 53-54":             {x:1480,y:2100,lines:["rapid"], lx:1496,ly:2100,anchor:"start"},
  "Sec 42-43":             {x:1480,y:2160,lines:["rapid"], lx:1496,ly:2160,anchor:"start"},
  "DLF Phase 1":           {x:1480,y:2220,lines:["rapid"], lx:1496,ly:2220,anchor:"start"},
  "DLF Phase 2":           {x:1320,y:2160,lines:["rapid"], lx:1304,ly:2160,anchor:"end"},
  "Belvedere Towers":      {x:1320,y:2220,lines:["rapid"], lx:1304,ly:2220,anchor:"end"},
  "Cyber City":            {x:1320,y:2280,lines:["rapid"], lx:1304,ly:2280,anchor:"end"},
  "Moulsari Avenue":       {x:1400,y:2280,lines:["rapid"], lx:1384,ly:2280,anchor:"end"},
  "DLF Phase 3":           {x:1400,y:2340,lines:["rapid"], lx:1384,ly:2340,anchor:"end"},
};

const PATHS: Record<string,string[]> = {
  yellow:  ["Samaypur Badli","Rohini Sec 18,19","Haiderpur Badli Mor","Jahangirpuri","Adarsh Nagar","Azadpur","Model Town","GTB Nagar","Vishwavidyalaya","Vidhan Sabha","Civil Lines","Kashmere Gate","Chandni Chowk","Chawri Bazar","New Delhi","Rajiv Chowk","Patel Chowk","Central Secretariat","Udyog Bhawan","Lok Kalyan Marg","Jor Bagh","INA","AIIMS","Green Park","Hauz Khas","Malviya Nagar","Saket","Qutab Minar","Chhattarpur","Sultanpur","Ghitorni","Arjan Garh","Guru Dronacharya","Sikandarpur","MG Road","IFFCO Chowk","Huda City Centre"],
  red:     ["Rithala","Rohini West","Rohini East","Pitam Pura","Kohat Enclave","Netaji Subash Place","Keshav Puram","Kanhaiya Nagar","Inderlok","Shastri Nagar","Pratap Nagar","Pul Bangash","Tis Hazari","Kashmere Gate","Shastri Park","Seelampur","Welcome","Shahdara","Mansarovar Park","Jhil Mil","Dilshad Garden","Shaheed Nagar","Raj Bagh","Major Mohit Sharma","Shyam Park","Mohan Nagar","Arthala","Hindon River","Shaheed Sthal"],
  blue:    ["Dwarka Sec 21","Dwarka Sec 8","Dwarka Sec 9","Dwarka Sec 10","Dwarka Sec 11","Dwarka Sec 12","Dwarka Sec 13","Dwarka Sec 14","Dwarka","Dwarka Mor","Nawada","Uttam Nagar West","Uttam Nagar East","Janakpuri West","Janakpuri East","Tilak Nagar","Subhash Nagar","Tagore Garden","Rajouri Garden","Ramesh Nagar","Moti Nagar","Shadipur","Patel Nagar","Rajendra Place","Karol Bagh","Jhandewalan","RK Ashram Marg","Rajiv Chowk","Barakhamba Road","Mandi House","Pragati Maidan","Indraprastha","Yamuna Bank","Akshardham","Mayur Vihar-1","Mayur Vihar Ext","New Ashok Nagar","Noida Sec 15","Noida Sec 16","Noida Sec 18","Botanical Garden","Golf Course","Noida City Centre","Noida Sec 34","Noida Sec 52","Noida Sec 61","Noida Sec 59","Noida Sec 62","Noida Electronic City"],
  blueB:   ["Yamuna Bank","Laxmi Nagar","Nirman Vihar","Preet Vihar","Karkarduma","Karkarduma Court","Anand Vihar","Kaushambi","Vaishali"],
  violet:  ["Kashmere Gate","Lal Quila","Jama Masjid","Delhi Gate","ITO","Mandi House","Janpath","Central Secretariat","Khan Market","JLN Stadium","Jangpura","Lajpat Nagar","Moolchand","Kailash Colony","Nehru Place","Kalkaji Mandir","Govind Puri","Okhla","Jasola Apollo","Sarita Vihar","Mohan Estate","Tughlakabad","Badarpur","Sarai","NHPC Chowk","Mewala Maharajpur","Sec 28 Faridabad","Badkal Mor","Old Faridabad","Neelam Chowk Ajronda","Bata Chowk","Escorts Mujesar","Raja Nahar Singh"],
  pink:    ["Majlis Park","Azadpur","Shalimar Bagh","Netaji Subash Place","Shakurpur","Punjabi Bagh West","ESI Basai Darapur","Rajouri Garden","Maya Puri","Naraina Vihar","Delhi Cantt","Durgabai Deshmukh","Sir VM Moti Bagh","Bhikaji Cama Place","Sarojini Nagar","INA","South Extension","Lajpat Nagar","Vinobapuri","Ashram","Sarai Kale Khan","Mayur Vihar-1","Mayur Vihar Pocket 1","Trilokpuri","Vinod Nagar East","Mandawali","IP Extension","Anand Vihar","Karkarduma","Krishna Nagar","East Azad Nagar","Welcome","Jaffrabad","Maujpur","Gokulpuri","Johri Enclave","Shiv Vihar"],
  magenta: ["Janakpuri West","Dabri Mor","Dashrath Puri","Palam","Sadar Bazar Cantonment","Terminal 1 IGI","Shankar Vihar","Vasant Vihar","Munirka","RK Puram","IIT Delhi","Hauz Khas","Panchsheel Park","Chirag Delhi","Greater Kailash","Nehru Enclave","Kalkaji Mandir","Okhla NSIC","Sukhdev Vihar","Jamia Millia Islamia","Okhla Vihar","Jasola Vihar SB","Kalindi Kunj","Okhla Bird Sanctuary","Botanical Garden"],
  green:   ["Inderlok","Ashok Park Main","Punjabi Bagh","Shivaji Park","Madipur","Paschim Vihar East","Paschim Vihar West","Peera Garhi","Udyog Nagar","Maharaja Surajmal","Nangloi","Nangloi Railway Stn","Rajdhani Park","Mundka","Mundka Industrial","Ghevra","Tikri Kalan","Tikri Border","Pandit Shree Ram","Bahadurgarh City","Brigadier Hoshiyar"],
  greenB:  ["Ashok Park Main","Satguru Ram Singh","Kirti Nagar"],
  orange:  ["New Delhi","Shivaji Stadium","Dhaula Kuan","Delhi Aerocity","IGI Airport T3","Dwarka Sec 21"],
  gray:    ["Dwarka","Nangli","Najafgarh","Dhana Bus Stand"],
  aqua:    ["Noida Sec 52","Noida Sec 51","Noida Sec 50","Noida Sec 76","Noida Sec 101","Noida Sec 81","NSEZ","Noida Sec 83","Noida Sec 137","Noida Sec 142","Noida Sec 143","Noida Sec 144","Noida Sec 145","Noida Sec 146","Noida Sec 147","Noida Sec 148","Knowledge Park 2","Pari Chowk","Alpha 1","Delta 1","GNIDA Office","Depot Greater Noida"],
  rapid:   ["Sikandarpur","Sec 53-54","Sec 42-43","DLF Phase 1","Sikandarpur","DLF Phase 2","Belvedere Towers","Cyber City","Moulsari Avenue","DLF Phase 3"],
};

interface Props { highlightedRoute?: RouteResponse | null; }

export default function MetroMap({ highlightedRoute }: Props) {
  const [zoom, setZoom]     = useState(0.28);
  const [pan, setPan]       = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x:0, y:0 });
  const [hovered, setHovered]   = useState<string|null>(null);
  const [activeLine, setActiveLine] = useState<string|null>(null);
  const [visibleDots, setVisibleDots] = useState<Set<number>>(new Set());
  const animTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const routeNames  = new Set(highlightedRoute?.route?.map(s => s.name) ?? []);
  const hasRoute    = routeNames.size > 0;

  // Animate dots when route changes
  useEffect(() => {
    animTimers.current.forEach(clearTimeout);
    animTimers.current = [];
    setVisibleDots(new Set());
    if (!highlightedRoute?.route?.length) return;
    highlightedRoute.route.forEach((_, i) => {
      const t = setTimeout(() => setVisibleDots(p => new Set([...p, i])), i * 60);
      animTimers.current.push(t);
    });
    return () => animTimers.current.forEach(clearTimeout);
  }, [highlightedRoute]);

  const routePolyPts = hasRoute
    ? highlightedRoute!.route!.map(s => ST[s.name]).filter(Boolean).map(s => `${s!.x},${s!.y}`).join(" ")
    : "";

  const onMouseDown = (e: React.MouseEvent) => { setDragging(true); setDragStart({x:e.clientX-pan.x, y:e.clientY-pan.y}); };
  const onMouseMove = (e: React.MouseEvent) => { if(dragging) setPan({x:e.clientX-dragStart.x, y:e.clientY-dragStart.y}); };
  const onMouseUp   = () => setDragging(false);
  const onWheel     = useCallback((e:React.WheelEvent) => { e.preventDefault(); setZoom(z => Math.min(5, Math.max(0.1, z-e.deltaY*0.001))); }, []);

  const pts = (k: string) => PATHS[k].map(n=>ST[n]).filter(Boolean).map(s=>`${s!.x},${s!.y}`).join(" ");

  // Always show all labels
  const showLabel = (_name: string, _isIC: boolean) => true;

  const isDimmed = (name: string) => {
    if (hasRoute) return !routeNames.has(name);
    if (activeLine) return !ST[name]?.lines.includes(activeLine);
    return false;
  };

  return (
    <div className="flex gap-3 w-full" style={{height:"700px"}}>

      {/* Legend */}
      <div className="w-44 flex-shrink-0 bg-black/50 border border-white/10 rounded-2xl p-3 overflow-y-auto flex flex-col gap-1">
        <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2 font-bold">Metro Lines</p>
        {Object.entries(LL).map(([k,label]) => (
          <button key={k}
            onClick={() => !hasRoute && setActiveLine(a => a===k ? null : k)}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all
              ${!hasRoute && activeLine===k ? "bg-white/15" : "hover:bg-white/5"}
              ${(!hasRoute && activeLine && activeLine!==k) ? "opacity-20" : "opacity-100"}
              ${hasRoute ? "cursor-default" : "cursor-pointer"}`}
          >
            <span className="w-5 h-2.5 rounded-sm flex-shrink-0" style={{background:LC[k]}}/>
            <span className="text-[10px] text-white/80 font-medium leading-tight">{label}</span>
          </button>
        ))}
        {activeLine && !hasRoute && (
          <button onClick={() => setActiveLine(null)} className="mt-1 text-[9px] text-white/30 hover:text-white/60 px-2 text-left">
            ✕ Show all
          </button>
        )}
        {hasRoute && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
            <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Route Active</p>
            <p className="text-[9px] text-white/60 leading-snug">{highlightedRoute!.start} → {highlightedRoute!.end}</p>
            <p className="text-[9px] text-white/40">{highlightedRoute!.stops} stops · {highlightedRoute!.approx_time_minutes} min</p>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-[9px] text-white/25 leading-snug">
            Scroll to zoom · Drag to pan · Hover a station for details
          </p>
        </div>
      </div>

      {/* Map canvas */}
      <div className="flex-1 relative bg-[#06080f] border border-white/10 rounded-2xl overflow-hidden"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp} onWheel={onWheel}
        style={{cursor: dragging ? "grabbing" : "grab"}}
      >
        {/* Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
          {([["＋",0.1],["－",-0.1],["⊙","reset"]] as const).map(([ic,d]) => (
            <button key={String(ic)}
              onClick={() => d==="reset" ? (setZoom(0.28),setPan({x:20,y:20})) : setZoom(z=>Math.min(5,Math.max(0.1,z+(d as number))))}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center justify-center transition-colors"
            >{ic}</button>
          ))}
        </div>

        <p className="absolute bottom-3 right-3 text-[9px] text-white/15 select-none">
          Scroll to zoom · Drag to pan
        </p>
        {/* Tooltip */}
        {hovered && ST[hovered] && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/90 border border-white/20 rounded-xl px-4 py-2.5 text-center max-w-xs">
            <p className="text-white font-semibold text-sm">{hovered}</p>
            <div className="flex gap-1.5 mt-1.5 justify-center flex-wrap">
              {ST[hovered].lines.map(l=>(
                <span key={l} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{background:LC[l]+"30",color:LC[l],border:`1px solid ${LC[l]}60`}}>
                  {LL[l]}
                </span>
              ))}
              {ST[hovered].ic && <span className="text-[10px] text-white/40 px-2 py-0.5 rounded-full border border-white/15">⇄ interchange</span>}
              {routeNames.has(hovered) && <span className="text-[10px] text-primary px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10">On your route</span>}
            </div>
          </div>
        )}

        <svg width="100%" height="100%" style={{userSelect:"none"}}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="sglow">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>

          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>

            {/* Base line tracks */}
            {Object.keys(PATHS).map(lk => (
              <polyline key={lk} points={pts(lk)} fill="none"
                stroke={LC[lk]}
                strokeWidth={!hasRoute && activeLine===lk ? 16 : 10}
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={lk==="orange" ? "24 12" : undefined}
                opacity={hasRoute ? 0.07 : activeLine && activeLine!==lk ? 0.06 : 0.92}
                style={{transition:"opacity 0.4s, stroke-width 0.2s"}}
              />
            ))}

            {/* Highlighted route — glow + track */}
            {hasRoute && routePolyPts && (<>
              <polyline points={routePolyPts} fill="none" stroke="white"
                strokeWidth={28} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.06} filter="url(#glow)"/>
              <polyline points={routePolyPts} fill="none" stroke="white"
                strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
                opacity={0.95}
                style={{strokeDasharray:5000, strokeDashoffset:5000, animation:"drawRoute 1.4s ease-out forwards"}}/>
            </>)}

            {/* Stations */}
            {Object.entries(ST).map(([name, s]) => {
              const isIC    = !!s.ic;
              const isHov   = hovered===name;
              const onRoute = routeNames.has(name);
              const dimmed  = isDimmed(name);
              const color   = LC[s.lines[0]] || "#888";
              const r       = isIC ? 14 : 7;
              const showLbl = showLabel(name, isIC);
              const routeIdx = hasRoute ? (highlightedRoute!.route?.findIndex(rs=>rs.name===name) ?? -1) : -1;
              const animated = routeIdx>=0 && visibleDots.has(routeIdx);

              return (
                <g key={name} style={{cursor:"pointer"}}
                  onMouseEnter={()=>setHovered(name)}
                  onMouseLeave={()=>setHovered(null)}
                >
                  {isIC && (
                    <circle cx={s.x} cy={s.y} r={r+8} fill="none"
                      stroke={onRoute ? "white" : color} strokeWidth={onRoute?3:2}
                      opacity={dimmed ? 0 : isHov ? 0.6 : onRoute ? 0.45 : 0.22}
                      style={{transition:"all 0.3s"}}/>
                  )}
                  {onRoute && animated && (
                    <circle cx={s.x} cy={s.y} r={r+16} fill="none"
                      stroke="white" strokeWidth={1.5}
                      opacity={0.25} filter="url(#sglow)"/>
                  )}
                  <circle cx={s.x} cy={s.y}
                    r={onRoute && animated ? (isIC?r+4:r+3) : isHov ? r+4 : r}
                    fill={onRoute && animated ? "white" : isIC ? "#06080f" : color}
                    stroke={onRoute && animated ? "white" : color}
                    strokeWidth={isIC ? 4 : 2}
                    opacity={dimmed ? 0.04 : 1}
                    style={{transition:"all 0.25s"}}
                    filter={onRoute && animated ? "url(#sglow)" : undefined}
                  />
                  {showLbl && (
                    <text x={s.lx ?? s.x+10} y={s.ly ?? s.y+5}
                      textAnchor={s.anchor ?? "start"}
                      fontSize={isHov||(onRoute&&animated) ? 20 : isIC ? 18 : 15}
                      fontFamily="'Space Grotesk', system-ui, sans-serif"
                      fontWeight={isIC||isHov||(onRoute&&animated) ? "700" : "400"}
                      fill={onRoute&&animated ? "white" : isHov ? "rgba(255,255,255,0.95)" : isIC ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.6)"}
                      stroke="#06080f" strokeWidth="5" paintOrder="stroke"
                      opacity={dimmed ? 0 : 1}
                      style={{pointerEvents:"none", transition:"all 0.25s"}}
                    >{name}</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <style>{`
          @keyframes drawRoute {
            from { stroke-dashoffset: 5000; opacity: 0; }
            to   { stroke-dashoffset: 0;    opacity: 0.95; }
          }
        `}</style>

        <p className="absolute bottom-3 right-3 text-[9px] text-white/15 select-none">
          Scroll to zoom · Drag to pan
        </p>
      </div>
    </div>
  );
}