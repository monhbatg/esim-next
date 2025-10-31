"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCheckout } from '@/contexts/CheckoutContext';
import { EsimPlan } from '@/types';

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

const regions = ['All', 'North America', 'Europe', 'Asia', 'Oceania'];

function codeToFlagEmoji(isoCode: string): string {
  if (!isoCode) return '🌐';
  const code = isoCode.trim().toUpperCase();
  if (code.length !== 2) return '🌐';
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
  return match ? match[1].trim() : 'All';
}

function formatDuration(duration: number, unit: string): string {
  const lower = unit?.toLowerCase() || 'day';
  const plural = duration === 1 ? '' : 's';
  return `${duration} ${lower}${plural}`;
}

function formatPrice(amountMinor: number): number {
  // Assume incoming price is in minor units (e.g., cents)
  const factor = 100;
  return parseFloat((amountMinor / factor).toFixed(2));
}

function mapPackageToEsimPlan(pkg: (typeof packageList)[number], index: number): EsimPlan {
  const firstIsoCode = pkg.location.split(',')[0]?.trim();
  const firstLocationName = pkg.locationNetworkList?.[0]?.locationName || 'Multi-country';
  const region = extractRegionFromName(pkg.name);
  const price = formatPrice(pkg.price);
  const features: string[] = [
    `${pkg.speed} Speed`,
    `${pkg.locationNetworkList?.length || 1} countries covered`,
    'No Contract',
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
  };
}

export default function Marketplace() {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setSelectedPlan } = useCheckout();

  const plans: EsimPlan[] = packageList.map(mapPackageToEsimPlan);

  const filteredPlans = selectedRegion === 'All'
    ? plans
    : plans.filter(plan => plan.region === selectedRegion);

  const handlePurchase = (plan: EsimPlan) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingPurchase', JSON.stringify(plan));
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      router.push('/login');
    } else {
      setSelectedPlan(plan);
      router.push('/checkout');
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
            Choose from our wide selection of eSIM plans for destinations worldwide
          </p>
        </div>

        {/* Filter */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 ${
                  selectedRegion === region
                    ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} hover className="flex flex-col group">
                <div className="mb-6 pb-6 border-b-2 border-slate-200">
                  <div className="text-7xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{plan.flag}</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{plan.country}</h3>
                  <p className="text-sm text-slate-500 font-semibold">{plan.region}</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">${plan.price}</span>
                    <span className="text-slate-500 font-semibold">/ {plan.duration}</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">{plan.data} Data</p>
                </div>

                <div className="mb-6 grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-700 font-medium">
                        <span className="mr-3 text-emerald-600 font-black text-xl">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => handlePurchase(plan)}
                >
                  Purchase Plan →
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto mt-20 text-center">
          <Card className="bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200">
            <h2 className="text-3xl font-black mb-4 text-slate-900">Need Help Choosing?</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Not sure which plan is right for you? Our support team is here to help you find the perfect connectivity solution.
            </p>
            <Button variant="outline" size="lg">
              Contact Support →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}


