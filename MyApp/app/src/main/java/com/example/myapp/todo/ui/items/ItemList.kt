package com.example.myapp.todo.ui.items

import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.myapp.todo.data.Item
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import androidx.compose.material.Icon
import androidx.compose.material.MaterialTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info

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
    var isExpanded by remember { mutableStateOf(false) }
    Surface (
        modifier = Modifier.fillMaxWidth(),
        shadowElevation = 2.dp,
        onClick = { isExpanded = !isExpanded }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .animateContentSize()
        ) {
            Row {
                Icon(imageVector = Icons.Default.Info , contentDescription = null)
                Spacer(modifier = Modifier.width(16.dp))
                androidx.compose.material.Text(
                    text = "${item.make} ${item.model}",
                    style = MaterialTheme.typography.body1
                )
            }
            if (isExpanded) {
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
