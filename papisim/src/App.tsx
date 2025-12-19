import React, { useState, useEffect } from 'react';

const PAPISimulator = () => {
  const [glideSlope, setGlideSlope] = useState(3.0);
  const [distance, setDistance] = useState(5.0);
  const [altitude, setAltitude] = useState(1592);
  const [unit, setUnit] = useState('ft');
  const [autoMode, setAutoMode] = useState(true);

  // Irtifayı feet cinsinden döndür
  const getAltitudeInFeet = () => {
    return unit === 'm' ? altitude * 3.28084 : altitude;
  };

  // Mesafeyi nautical mile cinsinden döndür
  const getDistanceInNM = () => {
    return distance;
  };

  // Uçağın mevcut açısını hesapla
  const calculateAircraftAngle = () => {
    const altFt = getAltitudeInFeet();
    const distNM = getDistanceInNM();
    const distFt = distNM * 6076.12; // NM to feet
    return (Math.atan(altFt / distFt) * 180 / Math.PI);
  };

  // Auto mode: glide slope'a göre irtifayı ayarla
  useEffect(() => {
    if (autoMode) {
      const distFt = getDistanceInNM() * 6076.12;
      const targetAltFt = Math.tan(glideSlope * Math.PI / 180) * distFt;
      setAltitude(unit === 'm' ? Math.round(targetAltFt / 3.28084) : Math.round(targetAltFt));
    }
  }, [glideSlope, distance, autoMode, unit]);

  const aircraftAngle = calculateAircraftAngle();

  // PAPI lambalarının durumunu hesapla
  const calculatePAPILights = () => {
    const deviation = aircraftAngle - glideSlope;
    
    
    const lamp1Threshold = 1.0;   // En soldaki
    const lamp2Threshold = 0.33;
    const lamp3Threshold = -0.33;
    const lamp4Threshold = -1.0;  // En sağdaki
    
    return [
      deviation > lamp1Threshold,  // Lamp 1: yüksekte beyaz
      deviation > lamp2Threshold,  // Lamp 2: yüksekte beyaz
      deviation > lamp3Threshold,  // Lamp 3: alçakta beyaz
      deviation > lamp4Threshold   // Lamp 4: alçakta beyaz
    ];
  };

  const papiLights = calculatePAPILights();

  // PAPI pattern açıklaması
  const getPAPIPattern = () => {
    const whiteCount = papiLights.filter(l => l).length;
    if (whiteCount === 4) return '4 B / 0 K - Çok Yüksek';
    if (whiteCount === 3) return '3 B / 1 K - Yüksek';
    if (whiteCount === 2) return '2 B / 2 K - İdeal';
    if (whiteCount === 1) return '1 B / 3 K - Düşük';
    return '0 B / 4 K - Çok Düşük';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">PAPI Simülatörü</h1>
        <p className="text-gray-600 mb-8">
          Bir uçağın son yaklaşma sırasında doğru süzülebilmesi için pistlerin yanında “Precision Approach Path Indicator” (PAPI ışıkları) bulunur. Yerde 4 adet kırmızı ve 4 adet beyaz ışık bulunur ve pilot aynı anda sadece 4 tanesini görür.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol panel - Görselleştirme */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ana görsel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="bg-gradient-to-b from-sky-200 to-sky-100 rounded-lg p-8 relative" style={{ height: '400px' }}>
                <svg width="100%" height="100%" viewBox="0 0 800 400" className="absolute top-0 left-0">
                  {/* Pist threshold noktası */}
                  <circle cx="700" cy="300" r="5" fill="#1F2937" />
                  
                  {/* Glide slope çizgisi - pistten başlayıp yukarı */}
                  <line
                    x1="700"
                    y1="300"
                    x2="50"
                    y2={300 - Math.tan(glideSlope * Math.PI / 180) * 650}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="10,5"
                  />
                  
                  {/* Uçak pozisyonu - mesafe ve irtifaya göre */}
                  <g transform={`translate(${700 - (distance / 10) * 650}, ${300 - (getAltitudeInFeet() / (10 * 6076.12)) * 650})`}>
                    <text x="0" y="0" textAnchor="middle" fontSize="32" dominantBaseline="middle">
                      🛩️
                    </text>
                    <text x="0" y="25" textAnchor="middle" className="text-xs font-semibold" fill="#1F2937">
                      Uçak
                    </text>
                  </g>

                  {/* Pist */}
                  <rect
                    x="640"
                    y="290"
                    width="120"
                    height="25"
                    fill="#1F2937"
                    rx="2"
                  />
                  <text x="710" y="330" textAnchor="middle" className="text-xs font-semibold" fill="#4B5563">
                    Pist
                  </text>

                  {/* Bilgi kutusu */}
                  <g transform="translate(20, 20)">
                    <rect width="200" height="80" fill="white" opacity="0.95" rx="4" />
                    <text x="10" y="25" className="text-sm font-semibold" fill="#1F2937">
                      Glide slope: {glideSlope.toFixed(2)}°
                    </text>
                    <text x="10" y="45" className="text-sm font-semibold" fill="#1F2937">
                      İrtifa: {getAltitudeInFeet().toFixed(0)} ft
                    </text>
                    <text x="10" y="65" className="text-sm font-semibold" fill="#1F2937">
                      Mesafe: {distance.toFixed(2)} NM
                    </text>
                  </g>
                </svg>
              </div>

             
            </div>

            {/* PAPI ışıkları */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                PAPI Durumu: {getPAPIPattern()}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Not: Model basitleştirilmiş bir optik model kullanır. Gerçek hayattaki PAPI ışınları daha karmaşıktır.
              </p>
              <div className="flex justify-center gap-6">
                {papiLights.map((isWhite, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className={`w-20 h-20 rounded-lg border-4 ${
                        isWhite
                          ? 'bg-white border-gray-300 shadow-gray-300/50'
                          : 'bg-red-600 border-red-700 shadow-red-500/50'
                      } shadow-lg transition-all duration-300`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ panel - Kontroller */}
          <div className="space-y-6">
            {/* Glide Slope */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Glide Slope (°): {glideSlope.toFixed(2)}
              </h3>
              <input
                type="range"
                min="2"
                max="4"
                step="0.1"
                value={glideSlope}
                onChange={(e) => setGlideSlope(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Mesafe */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Piste Yatay Uzaklık (NM): {distance.toFixed(2)}
              </h3>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Mod seçimi */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!autoMode}
                    onChange={() => setAutoMode(false)}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-gray-700">Manuel irtifa belirleme</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={autoMode}
                    onChange={() => setAutoMode(true)}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-gray-700">Uçağı glide path'e yerleştir</span>
                </label>
              </div>
            </div>

            {/* İrtifa */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Uçak irtifası ({unit}):
              </h3>
              <input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(parseFloat(e.target.value) || 0)}
                disabled={autoMode}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
              />
            </div>

            {/* Birim */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">İrtifa Birimi:</h3>
              <select
                value={unit}
                onChange={(e) => {
                  const newUnit = e.target.value;
                  if (newUnit !== unit) {
                    setAltitude(
                      newUnit === 'm'
                        ? Math.round(getAltitudeInFeet() / 3.28084)
                        : Math.round(getAltitudeInFeet())
                    );
                    setUnit(newUnit);
                  }
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="ft">ft</option>
                <option value="m">m</option>
              </select>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Simülasyon Çalışma Mantığı:</span> Yaklaşma açısı -- arctan(yaklaşma açısı) = irtifa / yatay mesafe, Referans Yaklaşma Açısı = 3 derece, PAPI sisteminde her lamba, farklı bir dikey görüş açısına göre ayarlanmıştır. 1.ışık = yaklaşma açısı + 1 derece, 2.ışık = yaklaşma açısı + 0.33 derece, 3.ışık = yaklaşma açısı - 0.33 derece, 4.ışık = yaklaşma açısı - 1 derece, Renk karar mekanızması da şöyle çalışmaktadır. Yaklaşma açısı, modellenen ışık açısından büyükse beyaz, küçükse kırmızı olarak belirlenmektedir. (1nm = 6076.12ft ve 1ft = 0,328m olarak hesaplanmaktadır. )
                  
                </p>
              </div>
            </div>

            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Hesap örneği</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Glide slope:</span> {glideSlope.toFixed(3)}°</p>
                <p><span className="font-semibold">İrtifa:</span> {getAltitudeInFeet().toFixed(0)} ft</p>
                <p><span className="font-semibold">PAPI pattern:</span> {getPAPIPattern()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PAPISimulator;