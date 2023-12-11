package com.example.myapp.utils

import android.service.autofill.OnClickAction
import android.util.Log
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*

val TAG = "MyMap"

@Composable
fun MyMap(lat: Double, long: Double, modifier: Modifier, onClick: (lat:Double,long:Double) -> Unit) {
    val markerState = rememberMarkerState(position = LatLng(lat, long))
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(markerState.position, 10f)
    }
    GoogleMap(
        modifier = modifier,
        cameraPositionState = cameraPositionState,
        onMapClick = { latLng ->
            Log.d(TAG, "onMapClick $latLng")
            markerState.position = latLng // Update marker position here
            onClick(latLng.latitude, latLng.longitude)
        },
        onMapLongClick = { latLng ->
            Log.d(TAG, "onMapLongClick $latLng")
            markerState.position = latLng // This is already correctly updating marker position
            onClick(latLng.latitude, latLng.longitude)
        },
    ) {
        Marker(
            state = MarkerState(position = markerState.position),
            title = "User location title",
            snippet = "${markerState.position.latitude},${markerState.position.longitude} ",
        )
    }
}

