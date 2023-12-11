package com.example.myapp.todo.ui

import android.util.Log
import androidx.compose.material.icons.Icons

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Icon
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.myapp.R
import com.example.myapp.core.Result
import com.example.myapp.todo.ui.item.ItemViewModel
import com.example.myapp.utils.MyMap
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.maps.android.compose.rememberMarkerState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemScreen(itemId: String?, onClose: () -> Unit) {
    val itemViewModel = viewModel<ItemViewModel>(factory = ItemViewModel.Factory(itemId))
    val itemUiState = itemViewModel.uiState
    var make by rememberSaveable { mutableStateOf(itemUiState.item?.make ?: "") }
    var model by rememberSaveable { mutableStateOf(itemUiState.item?.model ?: "") }
    var year by rememberSaveable { mutableStateOf(itemUiState.item?.year ?: 0) }
    var description by rememberSaveable { mutableStateOf(itemUiState.item?.description ?: "") }
    var isAvailable by rememberSaveable { mutableStateOf(itemUiState.item?.isAvailable ?: false) }
    var latitude by rememberSaveable { mutableStateOf(itemUiState.item?.latitude ?: 47.62) }
    var longitude by rememberSaveable { mutableStateOf(itemUiState.item?.longitude ?: 47.62) }

    val markerState = rememberMarkerState(position = LatLng(latitude, longitude))
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(markerState.position, 10f)
    }

    Log.d("ItemScreen", "recompose, text = $make")

    LaunchedEffect(itemUiState.savingCompleted) {
        Log.d("ItemScreen", "Saving completed = ${itemUiState.savingCompleted}");
        if (itemUiState.savingCompleted) {
            onClose();
        }
    }

    var textInitialized by remember { mutableStateOf(itemId == null) }
    LaunchedEffect(itemId, itemUiState.isLoading) {
        Log.d("ItemScreen", "Saving completed = ${itemUiState.savingCompleted}");
        if (textInitialized) {
            return@LaunchedEffect
        }
        if (itemUiState.item != null && !itemUiState.isLoading) {
            make = itemUiState.item.make
            model = itemUiState.item.model
            year = itemUiState.item.year
            description = itemUiState.item.description
            isAvailable = itemUiState.item.isAvailable
            latitude = itemUiState.item.latitude
            longitude = itemUiState.item.longitude
            textInitialized = true
            markerState.position = LatLng(latitude, longitude)
            cameraPositionState.position = CameraPosition.fromLatLngZoom(markerState.position, 1f)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(id = R.string.item)) },
                actions = {
                    Button(onClick = {
                        Log.d("ItemScreen", "save item text = $make");
                        itemViewModel.saveOrUpdateItem(make, model, year, description, isAvailable, latitude, longitude)
                    }) { Text("Save") }
                }
            )
        }
    ) {
        Column(
            modifier = Modifier
                .padding(it)
                .fillMaxSize()
        ) {
            if (itemUiState.isLoading) {
                CircularProgressIndicator()
                return@Scaffold
            }
            if (itemUiState.loadingError != null) {
                Text(text = "Failed to load item - ${itemUiState.loadingError.message}")
            }
            Row {
                Column {
                    TextField(
                        value = make,
                        onValueChange = { make = it }, label = { Text("Make") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    TextField(
                        value = model,
                        onValueChange = { model = it }, label = { Text("Model") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    OutlinedTextField(
                        value = year.toString(),
                        onValueChange = {
                            // Ensure only numbers are entered
                            if (it.all { char -> char.isDigit() } && it.isNotEmpty()) {
                                year = it.toInt()
                            }
                        },
                        label = { Text("Year") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    TextField(
                        value = description,
                        onValueChange = { description = it }, label = { Text("Description") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Row {
                        Text(
                            text = "Available",
                            modifier = Modifier.padding(start = 8.dp, top = 10.dp)
                        )
                        Checkbox(
                            checked = isAvailable,
                            onCheckedChange = {isAvailable = it},
                        )
                    }
                }
            }
            Row(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Text("Location:  ")
                    Text(
                        text = "latitude: ${latitude} , longitude: ${longitude}"
                    )
                    MyMap(
                        lat = latitude,
                        long = longitude,
                        modifier = Modifier.fillMaxSize(),
                        onClick = { lat, long ->
                            latitude = lat
                            longitude = long
                            // Update marker and camera position state directly
                            markerState.position = LatLng(lat, long)
                            cameraPositionState.position = CameraPosition.fromLatLngZoom(markerState.position, 10f)
                        }
                    )

                }
            }

            if (itemUiState.isSaving) {
                Column(
                    Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) { LinearProgressIndicator() }
            }
            if (itemUiState.savingError != null) {
                Text(text = "Failed to save item - ${itemUiState.savingError.message}")
            }
        }
    }
}


@Preview
@Composable
fun PreviewItemScreen() {
    ItemScreen(itemId = "0", onClose = {})
}
