package com.example.myapp.todo.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Date

@Entity(tableName = "items")
data class Item(
    @PrimaryKey
    var _id: String = "",
    val make: String = "",
    val model: String = "",
    val year: Int = 0,
    val description: String = "",
    val isAvailable: Boolean = false,
    val date: String = "",
    val latitude: Double = 46.0,
    val longitude: Double = 23.0
)
