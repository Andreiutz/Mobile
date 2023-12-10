package com.example.myapp

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.myapp.todo.data.Item

class ServerSavingWorker(
    context: Context,
    val workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {
    override suspend fun doWork(): Result {
        val itemRepository =(applicationContext as MyApplication).container.itemRepository;

        val isSaving = workerParams.inputData.getBoolean("isSaving", true);
        val id = workerParams.inputData.getString("id")!!
        val make = workerParams.inputData.getString("make")!!
        val model = workerParams.inputData.getString("model")!!
        val year = workerParams.inputData.getInt("year", 0)
        val description = workerParams.inputData.getString("description")!!
        val isAvailable = workerParams.inputData.getBoolean("isAvailable", false)
        val date = workerParams.inputData.getString("date")!!
        //val lat = workerParams.inputData.getDouble("lat", 0.0);
        //val long = workerParams.inputData.getDouble("long", 0.0);

        val item = Item (
            id, make, model, year, description, isAvailable, date
        )

        if(isSaving) {
            // delete the local saved value to not have duplicates
            itemRepository.deleteItem(item)
            itemRepository.save(item)
        } else {
            itemRepository.update(item)
        }

        return Result.success()
    }
}