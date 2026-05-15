import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, typography, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n';

function buildMapHtml(lat, lon) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  body { margin: 0; padding: 0; background: #0D0D1A; }
  #map { width: 100vw; height: 100vh; }
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map').setView([${lat}, ${lon}], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

var userIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#C9A84C;border:3px solid #fff;box-shadow:0 0 8px #C9A84C;"></div>',
  iconSize: [20, 20], iconAnchor: [10, 10], className: ''
});
L.marker([${lat}, ${lon}], { icon: userIcon }).addTo(map).bindPopup('<b>Sen buradasın</b>').openPopup();

var churchIcon = L.divIcon({
  html: '<div style="font-size:22px;line-height:1;">⛪</div>',
  iconSize: [28, 28], iconAnchor: [14, 28], className: ''
});

var query = '[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="christian"](around:5000,${lat},${lon});way["amenity"="place_of_worship"]["religion"="christian"](around:5000,${lat},${lon}););out center;';
fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: query
}).then(r => r.json()).then(data => {
  data.elements.forEach(function(el) {
    var lt = el.lat || (el.center && el.center.lat);
    var ln = el.lon || (el.center && el.center.lon);
    if (!lt || !ln) return;
    var name = el.tags && (el.tags.name || el.tags['name:tr'] || 'Kilise');
    L.marker([lt, ln], { icon: churchIcon }).addTo(map)
      .bindPopup('<b>' + name + '</b>');
  });
}).catch(function(e) { console.log('Overpass error', e); });
</script>
</body>
</html>`;
}

export default function ChurchMapScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const S = useMemo(() => makeStyles(colors), [colors]);

  const [state, setState] = useState('idle'); // idle | loading | ready | error
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { locate(); }, []);

  const locate = async () => {
    setState('loading');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(t('map_permission_denied'));
        setState('error');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      setState('ready');
    } catch {
      setErrorMsg(t('map_location_error'));
      setState('error');
    }
  };

  const openInMaps = () => {
    if (!coords) return;
    const url = `https://www.google.com/maps/search/church/@${coords.lat},${coords.lon},15z`;
    Linking.openURL(url);
  };

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientNight} style={S.header}>
        <View style={S.headerRow}>
          <View>
            <Text style={S.headerTitle}>{t('map_title')}</Text>
            <Text style={S.headerSub}>{t('map_subtitle')}</Text>
          </View>
          {state === 'ready' && (
            <TouchableOpacity onPress={openInMaps} style={S.mapsBtn} activeOpacity={0.8}>
              <Ionicons name="open-outline" size={16} color={colors.primary} />
              <Text style={S.mapsBtnText}>{t('map_open_maps')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {state === 'loading' && (
        <View style={S.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={S.centerText}>{t('map_locating')}</Text>
        </View>
      )}

      {state === 'error' && (
        <View style={S.center}>
          <Text style={S.errorIcon}>📍</Text>
          <Text style={S.centerText}>{errorMsg}</Text>
          <TouchableOpacity onPress={locate} style={S.retryBtn} activeOpacity={0.8}>
            <LinearGradient colors={colors.gradientGold} style={S.retryInner}>
              <Text style={[S.retryText, { color: colors.isDark ? '#000' : '#fff' }]}>{t('map_retry')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {state === 'ready' && coords && (
        <WebView
          source={{ html: buildMapHtml(coords.lat, coords.lon) }}
          style={S.map}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled
          onError={() => { setErrorMsg(t('map_location_error')); setState('error'); }}
        />
      )}
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container:   { flex: 1, backgroundColor: c.background },
  header:      { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: c.primary },
  headerSub:   { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 2 },
  mapsBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.primaryFaint, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1, borderColor: c.primary },
  mapsBtnText: { fontSize: typography.fontSizes.xs, color: c.primary, fontWeight: typography.fontWeights.medium },
  map:         { flex: 1 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  centerText:  { fontSize: typography.fontSizes.sm, color: c.textMuted, textAlign: 'center' },
  errorIcon:   { fontSize: 48 },
  retryBtn:    { borderRadius: borderRadius.full, overflow: 'hidden', marginTop: spacing.sm },
  retryInner:  { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  retryText:   { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold },
});
