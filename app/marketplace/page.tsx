"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { EsimPlan } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// New incoming API shape example
const packageList = [
  {
    packageCode: "CKH491",
    slug: "NA-3_1_7",
    name: "North America 1GB 7Days",
    price: 57000,
    currencyCode: "USD",
    volume: 1073741824,
    smsStatus: 1,
    dataType: 1,
    unusedValidTime: 180,
    duration: 7,
    durationUnit: "DAY",
    location: "MX,US,CA",
    description: "North America 1GB 7Days",
    activeType: 2,
    favorite: true,
    retailPrice: 114000,
    speed: "3G/4G",
    locationNetworkList: [
      {
        locationName: "United States",
        locationLogo: "/img/flags/us.png",
        operatorList: [
          { operatorName: "Verizon", networkType: "5G" },
          { operatorName: "T-Mobile", networkType: "5G" },
        ],
      },
      {
        locationName: "Canada",
        locationLogo: "/img/flags/ca.png",
        operatorList: [
          { operatorName: "Rogers Wireless", networkType: "5G" },
          { operatorName: "Videotron", networkType: "4G" },
        ],
      },
      {
        locationName: "Mexico",
        locationLogo: "/img/flags/mx.png",
        operatorList: [
          { operatorName: "Movistar", networkType: "4G" },
          { operatorName: "Telcel", networkType: "4G" },
        ],
      },
    ],
  },
];

// Build regions from availableLocations names (declared after availableLocations)

// Available locations dataset (regions with countries)
// Note: Trimmed to the structure needed for search/filtering
const availableLocations: Array<{
  code: string;
  name: string;
  type: number;
  subLocationList: Array<{ code: string; name: string }>;
}> = [
  {
    code: "EU-42",
    name: "Europe (40+ areas)",
    type: 2,
    subLocationList: [
      { code: "IS", name: "Iceland" },
      { code: "IE", name: "Ireland" },
      { code: "IT", name: "Italy" },
      { code: "LV", name: "Latvia" },
      { code: "LT", name: "Lithuania" },
      { code: "LU", name: "Luxembourg" },
      { code: "MT", name: "Malta" },
      { code: "NL", name: "Netherlands" },
      { code: "PL", name: "Poland" },
      { code: "PT", name: "Portugal" },
      { code: "RO", name: "Romania" },
      { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" },
      { code: "ES", name: "Spain" },
      { code: "SE", name: "Sweden" },
      { code: "CH", name: "Switzerland" },
      { code: "UA", name: "Ukraine" },
      { code: "GB", name: "United Kingdom" },
      { code: "AX", name: "Aland Islands" },
      { code: "IM", name: "Isle of Man" },
      { code: "JE", name: "Jersey" },
      { code: "RU", name: "Russia" },
      { code: "GG", name: "Guernsey" },
      { code: "LI", name: "Liechtenstein" },
      { code: "MK", name: "North Macedonia" },
      { code: "NO", name: "Norway" },
      { code: "RS", name: "Serbia" },
      { code: "GI", name: "Gibraltar" },
      { code: "AT", name: "Austria" },
      { code: "BE", name: "Belgium" },
      { code: "BG", name: "Bulgaria" },
      { code: "HR", name: "Croatia" },
      { code: "CY", name: "Cyprus" },
      { code: "CZ", name: "Czech Republic" },
      { code: "TR", name: "Turkey" },
      { code: "DK", name: "Denmark" },
      { code: "EE", name: "Estonia" },
      { code: "FI", name: "Finland" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "GR", name: "Greece" },
      { code: "HU", name: "Hungary" },
    ],
  },
  {
    code: "SA-18",
    name: "South America (15+ areas)",
    type: 2,
    subLocationList: [
      { code: "AR", name: "Argentina" },
      { code: "BO", name: "Bolivia" },
      { code: "BR", name: "Brazil" },
      { code: "CL", name: "Chile" },
      { code: "CO", name: "Colombia" },
      { code: "CR", name: "Costa Rica" },
      { code: "EC", name: "Ecuador" },
      { code: "SV", name: "El Salvador" },
      { code: "MQ", name: "French West Indies" },
      { code: "GT", name: "Guatemala" },
      { code: "HN", name: "Honduras" },
      { code: "NI", name: "Nicaragua" },
      { code: "PA", name: "Panama" },
      { code: "PY", name: "Paraguay" },
      { code: "PE", name: "Peru" },
      { code: "PR", name: "Puerto Rico" },
      { code: "UY", name: "Uruguay" },
    ],
  },
  {
    code: "NA-3",
    name: "North America (3 areas)",
    type: 2,
    subLocationList: [
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
      { code: "MX", name: "Mexico" },
    ],
  },
  {
    code: "AF-29",
    name: "Africa (25+ areas)",
    type: 2,
    subLocationList: [
      { code: "BF", name: "Burkina Faso" },
      { code: "RE", name: "Reunion" },
      { code: "MG", name: "Madagascar" },
      { code: "MW", name: "Malawi" },
      { code: "BW", name: "Botswana" },
      { code: "CF", name: "Central African Republic" },
      { code: "TD", name: "Chad" },
      { code: "CG", name: "Republic of the Congo" },
      { code: "CD", name: "Democratic Republic of the Congo" },
      { code: "CI", name: "Cote d'Ivoire" },
      { code: "EG", name: "Egypt" },
      { code: "GA", name: "Gabon" },
      { code: "GH", name: "Ghana" },
      { code: "GW", name: "Guinea-Bissau" },
      { code: "KE", name: "Kenya" },
      { code: "LR", name: "Liberia" },
      { code: "ML", name: "Mali" },
      { code: "MA", name: "Morocco" },
      { code: "NE", name: "Niger" },
      { code: "NG", name: "Nigeria" },
      { code: "SN", name: "Senegal" },
      { code: "SC", name: "Seychelles" },
      { code: "ZA", name: "South Africa" },
      { code: "SD", name: "Sudan" },
      { code: "SZ", name: "Eswatini" },
      { code: "TZ", name: "Tanzania" },
      { code: "TN", name: "Tunisia" },
      { code: "UG", name: "Uganda" },
      { code: "ZM", name: "Zambia" },
    ],
  },
  {
    code: "GL-139",
    name: "Global (130+ areas)",
    type: 2,
    subLocationList: [
      { code: "CN", name: "China mainland" },
      { code: "HK", name: "Hong Kong (China)" },
      { code: "TW", name: "Taiwan (China)" },
      { code: "MO", name: "Macao (China)" },
      { code: "TH", name: "Thailand" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
      { code: "VN", name: "Vietnam" },
      { code: "ID", name: "Indonesia" },
      { code: "PH", name: "Philippines" },
      { code: "KR", name: "South Korea" },
      { code: "IN", name: "India" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "KH", name: "Cambodia" },
      { code: "PK", name: "Pakistan" },
      { code: "LK", name: "Sri Lanka" },
      { code: "JP", name: "Japan" },
      { code: "AT", name: "Austria" },
      { code: "BE", name: "Belgium" },
      { code: "BG", name: "Bulgaria" },
      { code: "HR", name: "Croatia" },
      { code: "CY", name: "Cyprus" },
      { code: "CZ", name: "Czech Republic" },
      { code: "DK", name: "Denmark" },
      { code: "EE", name: "Estonia" },
      { code: "FI", name: "Finland" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "GR", name: "Greece" },
      { code: "HU", name: "Hungary" },
      { code: "IS", name: "Iceland" },
      { code: "IE", name: "Ireland" },
      { code: "IT", name: "Italy" },
      { code: "LV", name: "Latvia" },
      { code: "LT", name: "Lithuania" },
      { code: "LU", name: "Luxembourg" },
      { code: "MT", name: "Malta" },
      { code: "NL", name: "Netherlands" },
      { code: "PL", name: "Poland" },
      { code: "PT", name: "Portugal" },
      { code: "RO", name: "Romania" },
      { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" },
      { code: "ES", name: "Spain" },
      { code: "SE", name: "Sweden" },
      { code: "CH", name: "Switzerland" },
      { code: "UA", name: "Ukraine" },
      { code: "GB", name: "United Kingdom" },
      { code: "AX", name: "Aland Islands" },
      { code: "IM", name: "Isle of Man" },
      { code: "JE", name: "Jersey" },
      { code: "RU", name: "Russia" },
      { code: "LI", name: "Liechtenstein" },
      { code: "NO", name: "Norway" },
      { code: "RS", name: "Serbia" },
      { code: "GI", name: "Gibraltar" },
      { code: "IL", name: "Israel" },
      { code: "TR", name: "Turkey" },
      { code: "JO", name: "Jordan" },
      { code: "KW", name: "Kuwait" },
      { code: "OM", name: "Oman" },
      { code: "QA", name: "Qatar" },
      { code: "AE", name: "United Arab Emirates" },
      { code: "AZ", name: "Azerbaijan" },
      { code: "US", name: "United States" },
      { code: "AU", name: "Australia" },
      { code: "NZ", name: "New Zealand" },
      { code: "AR", name: "Argentina" },
      { code: "BO", name: "Bolivia" },
      { code: "BR", name: "Brazil" },
      { code: "CL", name: "Chile" },
      { code: "CO", name: "Colombia" },
      { code: "CR", name: "Costa Rica" },
      { code: "EC", name: "Ecuador" },
      { code: "SV", name: "El Salvador" },
      { code: "MQ", name: "French West Indies" },
      { code: "GT", name: "Guatemala" },
      { code: "HN", name: "Honduras" },
      { code: "NI", name: "Nicaragua" },
      { code: "PA", name: "Panama" },
      { code: "PY", name: "Paraguay" },
      { code: "PE", name: "Peru" },
      { code: "PR", name: "Puerto Rico" },
      { code: "UY", name: "Uruguay" },
      { code: "RE", name: "Reunion" },
      { code: "MG", name: "Madagascar" },
      { code: "MW", name: "Malawi" },
      { code: "BW", name: "Botswana" },
      { code: "TD", name: "Chad" },
      { code: "CG", name: "Republic of the Congo" },
      { code: "CD", name: "Democratic Republic of the Congo" },
      { code: "CI", name: "Cote d'Ivoire" },
      { code: "EG", name: "Egypt" },
      { code: "GA", name: "Gabon" },
      { code: "GH", name: "Ghana" },
      { code: "KE", name: "Kenya" },
      { code: "LR", name: "Liberia" },
      { code: "ML", name: "Mali" },
      { code: "MA", name: "Morocco" },
      { code: "NE", name: "Niger" },
      { code: "NG", name: "Nigeria" },
      { code: "SN", name: "Senegal" },
      { code: "SC", name: "Seychelles" },
      { code: "ZA", name: "South Africa" },
      { code: "SZ", name: "Eswatini" },
      { code: "TZ", name: "Tanzania" },
      { code: "TN", name: "Tunisia" },
      { code: "UG", name: "Uganda" },
      { code: "ZM", name: "Zambia" },
      { code: "CA", name: "Canada" },
      { code: "MX", name: "Mexico" },
      { code: "BD", name: "Bangladesh" },
      { code: "UZ", name: "Uzbekistan" },
      { code: "KZ", name: "Kazakhstan" },
      { code: "KG", name: "Kyrgyzstan" },
      { code: "XK", name: "Kosovo" },
      { code: "MD", name: "Moldova" },
      { code: "ME", name: "Montenegro" },
      { code: "AL", name: "Albania" },
      { code: "BA", name: "Bosnia and Herzegovina" },
      { code: "CM", name: "Cameroon" },
      { code: "BN", name: "Brunei Darussalam" },
      { code: "MK", name: "North Macedonia" },
    ],
  },
  {
    code: "ME-13",
    name: "Middle East",
    type: 2,
    subLocationList: [
      { code: "BH", name: "Bahrain" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "IL", name: "Israel" },
      { code: "TR", name: "Turkey" },
      { code: "JO", name: "Jordan" },
      { code: "KW", name: "Kuwait" },
      { code: "OM", name: "Oman" },
      { code: "QA", name: "Qatar" },
      { code: "AM", name: "Armenia" },
      { code: "AE", name: "United Arab Emirates" },
      { code: "AZ", name: "Azerbaijan" },
    ],
  },
  {
    code: "CN-3",
    name: "China (mainland HK Macao)",
    type: 2,
    subLocationList: [
      { code: "CN", name: "China mainland" },
      { code: "HK", name: "Hong Kong (China)" },
      { code: "MO", name: "Macao (China)" },
    ],
  },
  {
    code: "AS-7",
    name: "Asia (7 areas)",
    type: 2,
    subLocationList: [
      { code: "VN", name: "Vietnam" },
      { code: "ID", name: "Indonesia" },
      { code: "PH", name: "Philippines" },
      { code: "KH", name: "Cambodia" },
      { code: "TH", name: "Thailand" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
    ],
  },
  {
    code: "AS-20",
    name: "Asia (20 areas)",
    type: 2,
    subLocationList: [
      { code: "AU", name: "Australia" },
      { code: "NZ", name: "New Zealand" },
      { code: "CN", name: "China mainland" },
      { code: "HK", name: "Hong Kong (China)" },
      { code: "MO", name: "Macao (China)" },
      { code: "TH", name: "Thailand" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
      { code: "VN", name: "Vietnam" },
      { code: "ID", name: "Indonesia" },
      { code: "PH", name: "Philippines" },
      { code: "KR", name: "South Korea" },
      { code: "IN", name: "India" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "KH", name: "Cambodia" },
      { code: "PK", name: "Pakistan" },
      { code: "IL", name: "Israel" },
      { code: "LK", name: "Sri Lanka" },
      { code: "JP", name: "Japan" },
      { code: "KW", name: "Kuwait" },
    ],
  },
  {
    code: "AS-12",
    name: "Asia (12 areas)",
    type: 2,
    subLocationList: [
      { code: "VN", name: "Vietnam" },
      { code: "ID", name: "Indonesia" },
      { code: "KR", name: "South Korea" },
      { code: "KH", name: "Cambodia" },
      { code: "CN", name: "China mainland" },
      { code: "JP", name: "Japan" },
      { code: "HK", name: "Hong Kong (China)" },
      { code: "TW", name: "Taiwan (China)" },
      { code: "MO", name: "Macao (China)" },
      { code: "TH", name: "Thailand" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
    ],
  },
  {
    code: "SGMYTH-3",
    name: "Singapore & Malaysia & Thailand",
    type: 2,
    subLocationList: [
      { code: "TH", name: "Thailand" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
    ],
  },
  {
    code: "AUNZ-2",
    name: "Australia & New Zealand",
    type: 2,
    subLocationList: [
      { code: "AU", name: "Australia" },
      { code: "NZ", name: "New Zealand" },
    ],
  },
  {
    code: "EU-30",
    name: "Europe (30+ areas)",
    type: 2,
    subLocationList: [
      { code: "IS", name: "Iceland" },
      { code: "IE", name: "Ireland" },
      { code: "IT", name: "Italy" },
      { code: "LV", name: "Latvia" },
      { code: "LT", name: "Lithuania" },
      { code: "LU", name: "Luxembourg" },
      { code: "MT", name: "Malta" },
      { code: "NL", name: "Netherlands" },
      { code: "PL", name: "Poland" },
      { code: "PT", name: "Portugal" },
      { code: "RO", name: "Romania" },
      { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" },
      { code: "ES", name: "Spain" },
      { code: "SE", name: "Sweden" },
      { code: "CH", name: "Switzerland" },
      { code: "UA", name: "Ukraine" },
      { code: "GB", name: "United Kingdom" },
      { code: "LI", name: "Liechtenstein" },
      { code: "NO", name: "Norway" },
      { code: "AT", name: "Austria" },
      { code: "BE", name: "Belgium" },
      { code: "BG", name: "Bulgaria" },
      { code: "HR", name: "Croatia" },
      { code: "CY", name: "Cyprus" },
      { code: "CZ", name: "Czech Republic" },
      { code: "TR", name: "Turkey" },
      { code: "DK", name: "Denmark" },
      { code: "EE", name: "Estonia" },
      { code: "FI", name: "Finland" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "GR", name: "Greece" },
      { code: "HU", name: "Hungary" },
    ],
  },
  {
    code: "GL-120",
    name: "Global (120+ areas)",
    type: 2,
    subLocationList: [
      { code: "CN", name: "China mainland" },
      { code: "HK", name: "Hong Kong (China)" },
      { code: "TW", name: "Taiwan (China)" },
      { code: "MO", name: "Macao (China)" },
      { code: "TH", name: "Thailand" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
      { code: "ID", name: "Indonesia" },
      { code: "PH", name: "Philippines" },
      { code: "KR", name: "South Korea" },
      { code: "IN", name: "India" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "PK", name: "Pakistan" },
      { code: "LK", name: "Sri Lanka" },
      { code: "JP", name: "Japan" },
      { code: "AT", name: "Austria" },
      { code: "BE", name: "Belgium" },
      { code: "BG", name: "Bulgaria" },
      { code: "HR", name: "Croatia" },
      { code: "CY", name: "Cyprus" },
      { code: "CZ", name: "Czech Republic" },
      { code: "DK", name: "Denmark" },
      { code: "EE", name: "Estonia" },
      { code: "FI", name: "Finland" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "GR", name: "Greece" },
      { code: "HU", name: "Hungary" },
      { code: "IS", name: "Iceland" },
      { code: "IE", name: "Ireland" },
      { code: "IT", name: "Italy" },
      { code: "LV", name: "Latvia" },
      { code: "LT", name: "Lithuania" },
      { code: "LU", name: "Luxembourg" },
      { code: "MT", name: "Malta" },
      { code: "NL", name: "Netherlands" },
      { code: "PL", name: "Poland" },
      { code: "PT", name: "Portugal" },
      { code: "RO", name: "Romania" },
      { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" },
      { code: "ES", name: "Spain" },
      { code: "SE", name: "Sweden" },
      { code: "CH", name: "Switzerland" },
      { code: "UA", name: "Ukraine" },
      { code: "GB", name: "United Kingdom" },
      { code: "RU", name: "Russia" },
      { code: "LI", name: "Liechtenstein" },
      { code: "NO", name: "Norway" },
      { code: "RS", name: "Serbia" },
      { code: "GI", name: "Gibraltar" },
      { code: "IL", name: "Israel" },
      { code: "TR", name: "Turkey" },
      { code: "JO", name: "Jordan" },
      { code: "KW", name: "Kuwait" },
      { code: "OM", name: "Oman" },
      { code: "QA", name: "Qatar" },
      { code: "AM", name: "Armenia" },
      { code: "AE", name: "United Arab Emirates" },
      { code: "AZ", name: "Azerbaijan" },
      { code: "US", name: "United States" },
      { code: "AU", name: "Australia" },
      { code: "NZ", name: "New Zealand" },
      { code: "AR", name: "Argentina" },
      { code: "BO", name: "Bolivia" },
      { code: "BR", name: "Brazil" },
      { code: "CL", name: "Chile" },
      { code: "CO", name: "Colombia" },
      { code: "CR", name: "Costa Rica" },
      { code: "EC", name: "Ecuador" },
      { code: "SV", name: "El Salvador" },
      { code: "GT", name: "Guatemala" },
      { code: "HN", name: "Honduras" },
      { code: "NI", name: "Nicaragua" },
      { code: "PA", name: "Panama" },
      { code: "PY", name: "Paraguay" },
      { code: "PE", name: "Peru" },
      { code: "PR", name: "Puerto Rico" },
      { code: "UY", name: "Uruguay" },
      { code: "MG", name: "Madagascar" },
      { code: "MW", name: "Malawi" },
      { code: "BW", name: "Botswana" },
      { code: "CF", name: "Central African Republic" },
      { code: "TD", name: "Chad" },
      { code: "CG", name: "Republic of the Congo" },
      { code: "CD", name: "Democratic Republic of the Congo" },
      { code: "CI", name: "Cote d'Ivoire" },
      { code: "EG", name: "Egypt" },
      { code: "GA", name: "Gabon" },
      { code: "GH", name: "Ghana" },
      { code: "GW", name: "Guinea-Bissau" },
      { code: "KE", name: "Kenya" },
      { code: "LR", name: "Liberia" },
      { code: "ML", name: "Mali" },
      { code: "MA", name: "Morocco" },
      { code: "NE", name: "Niger" },
      { code: "NG", name: "Nigeria" },
      { code: "SN", name: "Senegal" },
      { code: "SC", name: "Seychelles" },
      { code: "ZA", name: "South Africa" },
      { code: "SZ", name: "Eswatini" },
      { code: "TZ", name: "Tanzania" },
      { code: "TN", name: "Tunisia" },
      { code: "UG", name: "Uganda" },
      { code: "ZM", name: "Zambia" },
      { code: "CA", name: "Canada" },
      { code: "MX", name: "Mexico" },
      { code: "GU", name: "Guam" },
      { code: "UZ", name: "Uzbekistan" },
      { code: "KZ", name: "Kazakhstan" },
      { code: "KG", name: "Kyrgyzstan" },
      { code: "XK", name: "Kosovo" },
      { code: "MD", name: "Moldova" },
      { code: "ME", name: "Montenegro" },
      { code: "AL", name: "Albania" },
      { code: "BA", name: "Bosnia and Herzegovina" },
      { code: "CM", name: "Cameroon" },
      { code: "MK", name: "North Macedonia" },
      { code: "MU", name: "Mauritius" },
    ],
  },
  {
    code: "AS-5",
    name: "Central Asia",
    type: 2,
    subLocationList: [
      { code: "UZ", name: "Uzbekistan" },
      { code: "KZ", name: "Kazakhstan" },
      { code: "KG", name: "Kyrgyzstan" },
      { code: "PK", name: "Pakistan" },
      { code: "LK", name: "Sri Lanka" },
    ],
  },
  {
    code: "ME-6",
    name: "Gulf Region",
    type: 2,
    subLocationList: [
      { code: "BH", name: "Bahrain" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "KW", name: "Kuwait" },
      { code: "QA", name: "Qatar" },
      { code: "IQ", name: "Iraq" },
      { code: "AE", name: "United Arab Emirates" },
    ],
  },
  {
    code: "CB-25",
    name: "Caribbean (20+ areas)",
    type: 2,
    subLocationList: [
      { code: "AR", name: "Argentina" },
      { code: "BO", name: "Bolivia" },
      { code: "BR", name: "Brazil" },
      { code: "CO", name: "Colombia" },
      { code: "DO", name: "Dominican Republic" },
      { code: "PY", name: "Paraguay" },
      { code: "GP", name: "Guadeloupe" },
      { code: "PE", name: "Peru" },
      { code: "PR", name: "Puerto Rico" },
      { code: "UY", name: "Uruguay" },
      { code: "AI", name: "Anguilla" },
      { code: "AG", name: "Antigua and Barbuda" },
      { code: "BB", name: "Barbados" },
      { code: "GD", name: "Grenada" },
      { code: "MS", name: "Montserrat" },
      { code: "KN", name: "Saint Kitts and Nevis" },
      { code: "AN", name: "Netherlands Antilles" },
      { code: "LC", name: "Saint Lucia" },
      { code: "GF", name: "French Guiana" },
      { code: "VC", name: "Saint Vincent and the Grenadines" },
      { code: "DM", name: "Dominica" },
      { code: "TC", name: "Turks and Caicos Islands" },
      { code: "VG", name: "Virgin Islands- British" },
      { code: "JM", name: "Jamaica" },
      { code: "KY", name: "Cayman Islands" },
    ],
  },
  {
    code: "CNJPKR-3",
    name: "China mainland & Japan & South Korea ",
    type: 2,
    subLocationList: [
      { code: "KR", name: "South Korea" },
      { code: "CN", name: "China mainland" },
      { code: "JP", name: "Japan" },
    ],
  },
  {
    code: "EU-43",
    name: "Europe (40+ areas) & Morocco",
    type: 2,
    subLocationList: [
      { code: "IS", name: "Iceland" },
      { code: "IE", name: "Ireland" },
      { code: "IT", name: "Italy" },
      { code: "LV", name: "Latvia" },
      { code: "LT", name: "Lithuania" },
      { code: "LU", name: "Luxembourg" },
      { code: "MT", name: "Malta" },
      { code: "NL", name: "Netherlands" },
      { code: "PL", name: "Poland" },
      { code: "PT", name: "Portugal" },
      { code: "RO", name: "Romania" },
      { code: "SK", name: "Slovakia" },
      { code: "SI", name: "Slovenia" },
      { code: "ES", name: "Spain" },
      { code: "SE", name: "Sweden" },
      { code: "CH", name: "Switzerland" },
      { code: "UA", name: "Ukraine" },
      { code: "GB", name: "United Kingdom" },
      { code: "AX", name: "Aland Islands" },
      { code: "IM", name: "Isle of Man" },
      { code: "JE", name: "Jersey" },
      { code: "RU", name: "Russia" },
      { code: "LI", name: "Liechtenstein" },
      { code: "MK", name: "North Macedonia" },
      { code: "NO", name: "Norway" },
      { code: "RS", name: "Serbia" },
      { code: "GI", name: "Gibraltar" },
      { code: "MA", name: "Morocco" },
      { code: "AT", name: "Austria" },
      { code: "BE", name: "Belgium" },
      { code: "BG", name: "Bulgaria" },
      { code: "HR", name: "Croatia" },
      { code: "CY", name: "Cyprus" },
      { code: "CZ", name: "Czech Republic" },
      { code: "TR", name: "Turkey" },
      { code: "DK", name: "Denmark" },
      { code: "EE", name: "Estonia" },
      { code: "FI", name: "Finland" },
      { code: "FR", name: "France" },
      { code: "DE", name: "Germany" },
      { code: "GR", name: "Greece" },
      { code: "HU", name: "Hungary" },
    ],
  },
  {
    code: "USCA-2",
    name: "USA & Canada",
    type: 2,
    subLocationList: [
      { code: "US", name: "United States" },
      { code: "CA", name: "Canada" },
    ],
  },
  {
    code: "EU-7",
    name: "Balkans (5+ areas)",
    type: 2,
    subLocationList: [
      { code: "BG", name: "Bulgaria" },
      { code: "HR", name: "Croatia" },
      { code: "MK", name: "North Macedonia" },
      { code: "ME", name: "Montenegro" },
      { code: "RS", name: "Serbia" },
      { code: "AL", name: "Albania" },
      { code: "GR", name: "Greece" },
    ],
  },
  {
    code: "AS-21",
    name: "Asia (20+ areas)",
    type: 2,
    subLocationList: [
      { code: "UZ", name: "Uzbekistan" },
      { code: "KZ", name: "Kazakhstan" },
      { code: "KG", name: "Kyrgyzstan" },
      { code: "CN", name: "China mainland" },
      { code: "HK", name: "Hong Kong (China)" },
      { code: "TW", name: "Taiwan (China)" },
      { code: "MO", name: "Macao (China)" },
      { code: "TH", name: "Thailand" },
      { code: "MY", name: "Malaysia" },
      { code: "SG", name: "Singapore" },
      { code: "VN", name: "Vietnam" },
      { code: "ID", name: "Indonesia" },
      { code: "PH", name: "Philippines" },
      { code: "KR", name: "South Korea" },
      { code: "IN", name: "India" },
      { code: "PK", name: "Pakistan" },
      { code: "LK", name: "Sri Lanka" },
      { code: "JP", name: "Japan" },
      { code: "BD", name: "Bangladesh" },
      { code: "LA", name: "Laos" },
    ],
  },
  {
    code: "ME-12",
    name: "Middle East & North Africa",
    type: 2,
    subLocationList: [
      { code: "BH", name: "Bahrain" },
      { code: "EG", name: "Egypt" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "TN", name: "Tunisia" },
      { code: "IL", name: "Israel" },
      { code: "TR", name: "Turkey" },
      { code: "JO", name: "Jordan" },
      { code: "KW", name: "Kuwait" },
      { code: "OM", name: "Oman" },
      { code: "MA", name: "Morocco" },
      { code: "QA", name: "Qatar" },
      { code: "AE", name: "United Arab Emirates" },
    ],
  },
  {
    code: "SAAEQAKWOMBH-6",
    name: "GCC (6 areas)",
    type: 2,
    subLocationList: [
      { code: "BH", name: "Bahrain" },
      { code: "SA", name: "Saudi Arabia" },
      { code: "KW", name: "Kuwait" },
      { code: "OM", name: "Oman" },
      { code: "QA", name: "Qatar" },
      { code: "AE", name: "United Arab Emirates" },
    ],
  },
];

// Build regions from availableLocations names
function normalizeRegionName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}
function regionEmoji(name: string): string {
  const n = normalizeRegionName(name).toLowerCase();
  if (n.includes("global")) return "🌐";
  if (n.includes("north america")) return "🌎";
  if (n.includes("south america")) return "🌎";
  if (n.includes("europe")) return "🌍";
  if (n.includes("asia")) return "🌏";
  if (n.includes("africa")) return "🌍";
  if (n.includes("middle east") || n.includes("gulf")) return "🕌";
  if (n.includes("caribbean")) return "🏝️";
  if (
    n.includes("australia") ||
    n.includes("new zealand") ||
    n.includes("oceania")
  )
    return "🦘";
  return "📍";
}
const regions = [
  "All",
  ...new Set([
    "North America",
    "Europe",
    "Asia",
    "Oceania",
    "Africa",
    "South America",
    "Middle East",
    "Global",
    ...availableLocations.map((g) => g.name),
  ]),
];

function codeToFlagEmoji(isoCode: string): string {
  if (!isoCode) return "🌐";
  const code = isoCode.trim().toUpperCase();
  if (code.length !== 2) return "🌐";
  const A = 0x1f1e6; // Regional Indicator Symbol Letter A
  return String.fromCodePoint(
    A + (code.codePointAt(0)! - 65),
    A + (code.codePointAt(1)! - 65)
  );
}

function formatVolume(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${Math.round(bytes / 1024 ** 3)}GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

function extractRegionFromName(name: string): string {
  const match = name.match(/^([A-Za-z ]+?)\s+\d/);
  return match ? match[1].trim() : "All";
}

function formatDuration(duration: number, unit: string): string {
  const lower = unit?.toLowerCase() || "day";
  const plural = duration === 1 ? "" : "s";
  return `${duration} ${lower}${plural}`;
}

function formatPrice(amountMinor: number): number {
  // Assume incoming price is in minor units (e.g., cents)
  const factor = 100;
  return parseFloat((amountMinor / factor).toFixed(2));
}

function mapPackageToEsimPlan(
  pkg: (typeof packageList)[number],
  index: number
): EsimPlan {
  const countriesCovered = pkg.location
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const firstIsoCode = countriesCovered[0];
  const firstLocationName =
    pkg.locationNetworkList?.[0]?.locationName || "Multi-country";
  const region = extractRegionFromName(pkg.name);
  const price = formatPrice(pkg.price);
  const features: string[] = [
    `${pkg.speed} Speed`,
    `${pkg.locationNetworkList?.length || 1} countries covered`,
    "No Contract",
  ];

  return {
    id: index + 1,
    country: firstLocationName,
    region,
    flag: codeToFlagEmoji(firstIsoCode),
    data: formatVolume(pkg.volume),
    duration: formatDuration(pkg.duration, pkg.durationUnit),
    price,
    features,
    countriesCovered,
  };
}

export default function Marketplace() {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const [showRegionModal, setShowRegionModal] = useState<boolean>(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setSelectedPlan } = useCheckout();

  const plans: EsimPlan[] = packageList.map(mapPackageToEsimPlan);

  // Build country maps for search suggestions and chip labels
  const countryCodeToName = useMemo(() => {
    const map = new Map<string, string>();
    availableLocations.forEach((group) => {
      group.subLocationList.forEach((sub) => {
        map.set(sub.code.toUpperCase(), sub.name);
      });
    });
    return map;
  }, []);

  const allCountriesList = useMemo(() => {
    const list: Array<{ code: string; name: string }> = [];
    countryCodeToName.forEach((name, code) => list.push({ code, name }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [countryCodeToName]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showRegionModal) {
        setShowRegionModal(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showRegionModal]);

  useEffect(() => {
    if (showRegionModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showRegionModal]);

  const filteredPlans = useMemo(() => {
    let result = plans;

    if (selectedRegion !== "All") {
      const baseSelected = normalizeRegionName(selectedRegion);
      result = result.filter(
        (plan) => normalizeRegionName(plan.region) === baseSelected
      );
    }

    if (selectedCountries.length > 0) {
      result = result.filter((plan) => {
        const covered = plan.countriesCovered || [];
        return covered.some((code) => selectedCountries.includes(code));
      });
    }

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter((plan) => {
        const coveredNames = (plan.countriesCovered || []).map(
          (c) => countryCodeToName.get(c) || c
        );
        return (
          plan.country.toLowerCase().includes(q) ||
          plan.region.toLowerCase().includes(q) ||
          plan.features.some((f) => f.toLowerCase().includes(q)) ||
          coveredNames.some((n) => n.toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [
    plans,
    selectedRegion,
    selectedCountries,
    debouncedQuery,
    countryCodeToName,
  ]);

  const handlePurchase = (plan: EsimPlan) => {
    if (!isAuthenticated) {
      sessionStorage.setItem("pendingPurchase", JSON.stringify(plan));
      sessionStorage.setItem("redirectAfterLogin", "/checkout");
      router.push("/login");
    } else {
      setSelectedPlan(plan);
      router.push("/checkout");
    }
  };

  return (
    <div className="py-20 md:py-28 bg-linear-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            eSIM Marketplace
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 leading-relaxed">
            Choose from our wide selection of eSIM plans for destinations
            worldwide
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid gap-4">
            <div>
              <label
                htmlFor="plan-search"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Search plans
              </label>
              <input
                id="plan-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={'Try "Japan", "Europe", or "5G"'}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-describedby="plan-search-help"
              />
              <p id="plan-search-help" className="mt-1 text-xs text-slate-500">
                Matches destination names, regions, and plan features.
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Region
              </span>
              {(searchQuery ||
                selectedCountries.length ||
                selectedRegion !== "All") && (
                <button
                  onClick={() => {
                    setSelectedRegion("All");
                    setSearchQuery("");
                    setSelectedCountries([]);
                  }}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <button
              onClick={() => setShowRegionModal(true)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white shadow-sm hover:border-emerald-400 hover:shadow-md transition-all text-left flex items-center justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-base">{regionEmoji(selectedRegion)}</span>
                <span className="font-medium text-slate-700">
                  {normalizeRegionName(selectedRegion)}
                </span>
              </span>
              <span className="text-slate-400">⌄</span>
            </button>
          </div>

          {/* Country multi-select */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Countries
                </span>
                {selectedCountries.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {selectedCountries.length} selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {selectedCountries.length > 0 && (
                  <button
                    onClick={() => setSelectedCountries([])}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2"
                  >
                    Clear countries
                  </button>
                )}
                <button
                  onClick={() => setShowCountryPicker((s) => !s)}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2"
                  aria-expanded={showCountryPicker}
                  aria-controls="country-picker"
                >
                  {showCountryPicker ? "Hide list" : "Show list"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedCountries.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold"
                >
                  <span>{codeToFlagEmoji(code)}</span>
                  <span>{countryCodeToName.get(code) || code}</span>
                  <button
                    aria-label={`Remove ${countryCodeToName.get(code) || code}`}
                    onClick={() =>
                      setSelectedCountries((prev) =>
                        prev.filter((c) => c !== code)
                      )
                    }
                    className="ml-1 text-emerald-700 hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedCountries.length === 0 && (
                <span className="text-slate-500">
                  Filter by country (optional)
                </span>
              )}
            </div>

            {showCountryPicker && (
              <div
                id="country-picker"
                className="mt-3 max-h-56 overflow-y-auto rounded-xl border-2 border-slate-200 bg-white p-2 grid grid-cols-2 md:grid-cols-3 gap-2"
              >
                {allCountriesList.map(({ code, name }) => {
                  const active = selectedCountries.includes(code);
                  return (
                    <button
                      key={code}
                      onClick={() =>
                        setSelectedCountries((prev) =>
                          active
                            ? prev.filter((c) => c !== code)
                            : [...prev, code]
                        )
                      }
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border ${
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{codeToFlagEmoji(code)}</span>
                        <span className="font-medium">{name}</span>
                      </span>
                      {active && (
                        <span className="text-emerald-600 font-bold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} hover className="flex flex-col group">
                <div className="mb-6 pb-6 border-b-2 border-slate-200">
                  <div className="text-7xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    {plan.flag}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">
                    {plan.country}
                  </h3>
                  <p className="text-sm text-slate-500 font-semibold">
                    {plan.region}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      / {plan.duration}
                    </span>
                  </div>
                  <p className="text-xl font-black text-slate-900">
                    {plan.data} Data
                  </p>
                </div>

                <div className="mb-6 grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-slate-700 font-medium"
                      >
                        <span className="mr-3 text-emerald-600 font-black text-xl">
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full" onClick={() => handlePurchase(plan)}>
                  Purchase Plan →
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <Card className="bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200">
            <h2 className="text-3xl font-black mb-4 text-slate-900">
              Need Help Choosing?
            </h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Not sure which plan is right for you? Our support team is here to
              help you find the perfect connectivity solution.
            </p>
            <Button variant="outline" size="lg">
              Contact Support →
            </Button>
          </Card>
        </div>
      </div>

      {/* Region Picker Modal */}
      {showRegionModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-start justify-center p-0 sm:p-4 sm:pt-16"
          onClick={() => setShowRegionModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div
            className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col h-[80vh] sm:max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 shrink-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Select Region
              </h3>
              <button
                onClick={() => setShowRegionModal(false)}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Region List - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      setShowRegionModal(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-colors border text-xs leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      selectedRegion === region
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
                    }`}
                    aria-pressed={selectedRegion === region}
                    title={normalizeRegionName(region)}
                  >
                    <span className="inline-flex items-center gap-2 w-full">
                      <span className="text-sm">{regionEmoji(region)}</span>
                      <span className="font-medium truncate flex-1">
                        {normalizeRegionName(region)}
                      </span>
                      {selectedRegion === region && (
                        <span className="text-[10px] font-bold opacity-90">✓</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
