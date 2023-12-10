package com.example.myapp.todo.ui.item

import android.app.Application
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.work.*
import com.example.myapp.MyApplication
import com.example.myapp.ServerSavingWorker
import com.example.myapp.core.Result
import com.example.myapp.core.TAG
import com.example.myapp.todo.data.Item
import com.example.myapp.todo.data.ItemRepository
import kotlinx.coroutines.launch

data class ItemUiState(
    val isLoading: Boolean = false,
    val loadingError: Throwable? = null,
    val itemId: String? = null,
    val item: Item? = null,
    val isSaving: Boolean = false,
    val savingCompleted: Boolean = false,
    val savingError: Throwable? = null,

)

class ItemViewModel(private val itemId: String?, private val itemRepository: ItemRepository, private val application: Application) :
    ViewModel() {

    var workManager: WorkManager

    var uiState: ItemUiState by mutableStateOf(ItemUiState(isLoading = true))
        private set

    init {
        Log.d(TAG, "init")
        if (itemId != null) {
            loadItem()
        } else {
            uiState = uiState.copy(item = Item(), isLoading = false)
        }
        workManager = WorkManager.getInstance(application)
    }

    fun loadItem() {
        viewModelScope.launch {
            itemRepository.itemStream.collect { items ->
                if (!(uiState.isLoading)) {
                    return@collect
                }
                val item = items.find { it._id == itemId } ?: Item()
                uiState = uiState.copy(item = item, isLoading = false)
            }
        }
    }


    fun saveOrUpdateItem(make: String, model: String, year: Int, description: String, isAvailable: Boolean) {
        viewModelScope.launch {
            Log.d(TAG, "saveOrUpdateItem...");
            try {
                uiState = uiState.copy(isSaving = true, savingError = null)
                val item = uiState.item?.copy(make = make, model = model, year = year, description = description, isAvailable = isAvailable)

                val constraints = Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()

                var isSaving = false

                if (itemId == null) {
                    itemRepository.saveLocal(item!!)
                    isSaving = true
                } else {
                    itemRepository.updateLocal(item!!)
                }

                val inputData =
                    Data.Builder()
                        .putBoolean("isSaving", isSaving)
                        .putString("id", item._id)
                        .putString("make", item.make)
                        .putString("model", item.model)
                        .putInt("year", item.year)
                        .putString("description", item.description)
                        .putBoolean("isAvailable", item.isAvailable)
                        .putString("date", item.date)
                        .build()

                val worker = OneTimeWorkRequest.Builder(ServerSavingWorker::class.java)
                    .setConstraints(constraints)
                    .setInputData(inputData)
                    .build()
                workManager.enqueue(worker);

                Log.d("INPUT DATA: $workManager", TAG)

                Log.d(TAG, "saveOrUpdateItem succeeeded");
                uiState = uiState.copy(isSaving = false, savingCompleted = true)
            } catch (e: Exception) {
                Log.d(TAG, "saveOrUpdateItem failed");
                uiState = uiState.copy(isSaving = false, savingError = e)
            }
        }
    }

    companion object {
        fun Factory(itemId: String?): ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val app =
                    (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as MyApplication)
                ItemViewModel(itemId, app.container.itemRepository, app)
            }
        }
    }
}
