package com.example.myapp.todo.ui.items

import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapp.todo.data.Item
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

typealias OnItemFn = (id: String?) -> Unit

@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun ItemList(itemList: List<Item>, onItemClick: OnItemFn, modifier: Modifier) {
    Log.d("ItemList", "recompose")
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        items(itemList) { item ->
            ItemDetail(item, onItemClick)
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemDetail(item: Item, onItemClick: OnItemFn) {
//    Log.d("ItemDetail", "recompose id = ${item.id}")
    Row {
        Card(
            onClick = {
                Log.d("Item clicked", "clicked ${item._id}")
                onItemClick(item._id)
            },
            colors = CardDefaults.cardColors(containerColor = Color(0xFFD0BCFF)),
            border = BorderStroke(1.dp, Color.Black)
        ) {
            Column(modifier = Modifier.padding(5.dp)) {
                Text(
                    text = "${item.make} - ${item.model}",
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                Text(
                    text = "Year ${item.year}",
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                Text(
                    text = if (item.isAvailable) "Available" else "Not available",
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                Text(
                    text = item.description,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                Text(
                    text = "Date: ${formatDate(item.date)}",
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
fun formatDate(fullFormat: String): String {
    val originalString = fullFormat // Example date string
    val originalFormat = DateTimeFormatter.ISO_ZONED_DATE_TIME // ISO format for parsing
    val newFormat = DateTimeFormatter.ofPattern("dd-MM-yyyy") // Desired format

    try {
        val zonedDateTime = ZonedDateTime.parse(originalString, originalFormat) // Parse the string
        val formattedString = zonedDateTime.format(newFormat) // Format the date
        return formattedString
    } catch (e: Exception) {
        return ""
    }
}
