package com.example.myapp

import android.Manifest
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.lifecycleScope
import com.example.myapp.core.TAG
import com.example.myapp.ui.theme.MyAppTheme
import kotlinx.coroutines.launch
import com.example.myapp.utils.Permissions
import com.google.accompanist.permissions.ExperimentalPermissionsApi


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Log.d(TAG, "onCreate")
            MyApp {
                MyAppNavHost()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        lifecycleScope.launch {
            (application as MyApplication).container.itemRepository.openWsClient()
        }
    }

    override fun onPause() {
        super.onPause()
        lifecycleScope.launch {
            (application as MyApplication).container.itemRepository.closeWsClient()
        }
    }
}

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun MyApp(content: @Composable () -> Unit) {
    Log.d("MyApp", "recompose")
    Permissions(
        permissions = listOf(
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_FINE_LOCATION
        ),
        rationaleText = "Please allow app to use location (coarse or fine)",
        dismissedText = "O noes! No location provider allowed!"
    ) {
        MyAppTheme {
            androidx.compose.material.Surface {
                content()
            }
        }
    }
}

@Preview
@Composable
fun PreviewMyApp() {
    MyApp {
        MyAppNavHost()
    }
}
