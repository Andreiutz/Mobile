package com.example.myapp.auth

import android.app.Application
import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.example.myapp.R
import com.example.myapp.createNotificationChannel
import com.example.myapp.showSimpleNotificationWithTapAction
import com.ilazar.myservices.util.ConnectivityManagerNetworkMonitor
import kotlinx.coroutines.launch

val TAG = "LoginScreen"

class MyNetworkStatusViewModel(application: Application) : AndroidViewModel(application) {
    var uiState by mutableStateOf(false)
        private set

    init {
        collectNetworkStatus()
    }

    private fun collectNetworkStatus() {
        viewModelScope.launch {
            ConnectivityManagerNetworkMonitor(getApplication()).isOnline.collect {
                uiState = it;
            }
        }
    }

    companion object {
        fun Factory(application: Application): ViewModelProvider.Factory = viewModelFactory {
            initializer {
                MyNetworkStatusViewModel(application)
            }
        }
    }
}

@Composable
fun MyNetworkStatus() {
    val myNewtworkStatusViewModel = viewModel<MyNetworkStatusViewModel>(
        factory = MyNetworkStatusViewModel.Factory(
            LocalContext.current.applicationContext as Application
        )
    )

    Text(
        "Is online: ${myNewtworkStatusViewModel.uiState}",
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(onClose: () -> Unit) {
    val context = LocalContext.current
    val channelId = "MyTestChannel"
    val notificationId = 0
    val loginViewModel = viewModel<LoginViewModel>(factory = LoginViewModel.Factory)
    val loginUiState = loginViewModel.uiState

    LaunchedEffect(Unit) {
        createNotificationChannel(channelId, context)
    }


    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.login)) }) },
    ) {
        Column(
            modifier = Modifier
                .padding(it)
                .fillMaxSize()
                .padding(24.dp)
        ) {
            MyNetworkStatus()
            var username by remember { mutableStateOf("") }
            TextField(
                label = { Text(text = "Username") },
                value = username,
                onValueChange = { username = it },
                modifier = Modifier.fillMaxWidth()
            )
            var password by remember { mutableStateOf("") }
            TextField(
                label = { Text(text = "Password") },
                visualTransformation = PasswordVisualTransformation(),
                value = password,
                onValueChange = { password = it },
                modifier = Modifier.fillMaxWidth()
            )
            Log.d(TAG, "recompose");
            Button(onClick = {
                Log.d(TAG, "login...");
                loginViewModel.login(username, password)
                showSimpleNotificationWithTapAction(
                    context,
                    channelId,
                    notificationId,
                    "Simple notification + Tap action",
                    "$username logged in successfully!"
                )
            }) {
                Text("Login")
            }
            if (loginUiState.isAuthenticating) {
                LinearProgressIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(15.dp)
                );
            }
            if (loginUiState.authenticationError != null) {
                Text(text = "Login failed ${loginUiState.authenticationError.message}")
            }
        }
    }

    LaunchedEffect(loginUiState.authenticationCompleted) {
        Log.d(TAG, "Auth completed");
        if (loginUiState.authenticationCompleted) {
            onClose();
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoginScreenPreview() {
    LoginScreen({})
}