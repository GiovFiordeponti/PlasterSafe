#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "lsm303dlhc.h"
#include "lsm303dlhc_params.h"
#include "xtimer.h"

lsm303dlhc_t dev;

int16_t temp_value;
lsm303dlhc_3d_data_t acc_value;

/**
 * Appends an integer value to the current string after a whitespace
 * 
 * @param {char *} msg the string where we want to insert the integer value
 * @param {int} value the integer value we want to append
 */
void concat_msg(char *msg, int value)
{
    char buf[12];
    snprintf(buf, 12, "%d ", value); // puts string into buffer
    strcat(msg, buf);
}

int main(void)
{
    if (lsm303dlhc_init(&dev, &lsm303dlhc_params[0]) != 0)
    {
        puts("failed");
        return 1;
    }
    

    while (1)
    {
        static char msg[100];
        memset(msg, 0, sizeof msg);
        if (lsm303dlhc_read_acc(&dev, &acc_value) == 0)
        {
            concat_msg(msg, acc_value.x_axis);
            concat_msg(msg, acc_value.y_axis);
            concat_msg(msg, acc_value.z_axis);
        }

        if (lsm303dlhc_read_temp(&dev, &temp_value) == 0)
        {
            concat_msg(msg, temp_value);
        }

        puts(msg);
        xtimer_sleep(1);
    }

    /* should be never reached */
    return 0;
}