package women.zapzoom.womensafetyapp;

import android.location.Location;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.plus.Plus;

import org.json.JSONObject;

import java.io.InputStream;
import java.io.OutputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;


public class StartTrackingActivity extends Base {
    Button startButton;
    EditText email;
    InputStream is=null;
    OutputStream os=null;
    Connection conn;
    String lat;
    String lon;
    Location mLastLocation;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_start_tracking);

        startButton= (Button) findViewById(R.id.startButton);
        email = (EditText) findViewById(R.id.email);
        startButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String s = email.getText().toString();
                sendPostRating(s);
            }
        });

        mLastLocation = LocationServices.FusedLocationApi.getLastLocation(
                mGoogleApiClient);
        if (mLastLocation != null) {
            lat = (String.valueOf(mLastLocation.getLatitude()));
            lon = (String.valueOf(mLastLocation.getLongitude()));
        }
    }
        @Override
        public void onConnected(Bundle connectionHint){

        {


        }
      }

    private void sendPostRating(String email) {
                RequestQueue queue = VolleySingleton.getInstance(this).getRequestQueue();

        Map<String,String> params = new HashMap<String, String>();
        params.put("email","testing@gmail.com");
        params.put("token","123123");
        params.put("tracker",email);
        params.put("lat",lat);
        params.put("long",lon);
        System.out.println("lat..."+lat+".......lon.."+lon);
        CustomRequest ratingPost = new CustomRequest(Request.Method.POST,"http://safeapp-brownhorse.rhcloud.com/createtrip" , params, new Response.Listener<JSONObject>() {

            @Override
            public void onResponse(JSONObject response) {
                //TODO: handle response if required
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError response) {
                //TODO: handle error if required
            }
        });

       queue.add(ratingPost);
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_start_tracking, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_signout) {
            if (mGoogleApiClient.isConnected()) {
                Plus.AccountApi.clearDefaultAccount(mGoogleApiClient);
                mGoogleApiClient.disconnect();
            }
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
    @Override
    public void onBackPressed() {
        finish();


    }

}
